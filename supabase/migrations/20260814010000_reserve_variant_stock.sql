-- Stage 19: variant stock reservation, mirroring reserve_product_stock/
-- release_product_stock (20260725010000) exactly — same atomic, all-or-
-- nothing decrement via a single RPC call, same additive/no-floor-check
-- release. New functions only; the existing product-stock RPCs are
-- untouched, and product_variant_stock's structure (Stage 14) is untouched
-- — this migration adds behavior, not schema.
--
-- reserve_variant_stock differs from reserve_product_stock in exactly one
-- respect: a variantId with no product_variant_stock row is SKIPPED rather
-- than rejected. Stock tracking is opt-in per variant (Stage 14) and
-- CheckoutService's existing read-only check (Stage 18) already treats an
-- untracked variant as having no stock constraint — this RPC stays
-- consistent with that check instead of failing a checkout the prior stage
-- already allowed through.

CREATE OR REPLACE FUNCTION public.reserve_variant_stock(items jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  item jsonb;
  v_variant_id uuid;
  v_quantity int;
  affected int;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    v_variant_id := (item->>'variantId')::uuid;
    v_quantity := (item->>'quantity')::int;

    IF NOT EXISTS (
      SELECT 1 FROM public.product_variant_stock WHERE variant_id = v_variant_id
    ) THEN
      CONTINUE;
    END IF;

    UPDATE public.product_variant_stock
    SET stock = stock - v_quantity
    WHERE variant_id = v_variant_id AND stock >= v_quantity;

    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected = 0 THEN
      RAISE EXCEPTION 'INSUFFICIENT_VARIANT_STOCK:%', v_variant_id;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_variant_stock(items jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    UPDATE public.product_variant_stock
    SET stock = stock + (item->>'quantity')::int
    WHERE variant_id = (item->>'variantId')::uuid;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reserve_variant_stock(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_variant_stock(jsonb) TO service_role;
