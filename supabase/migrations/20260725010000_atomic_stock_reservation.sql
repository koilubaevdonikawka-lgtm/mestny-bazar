-- Checkout never actually decremented products.stock — InventoryService only read it
-- via a plain SELECT (check-then-later-do-nothing), so stock never ran out and two
-- concurrent orders could both "pass" a stock check for the last unit (TOCTOU race).
-- These functions perform the check-and-decrement atomically, in one statement per
-- item, all inside a single function invocation (single transaction): if any item
-- has insufficient stock the whole reservation raises and rolls back.

CREATE OR REPLACE FUNCTION public.reserve_product_stock(items jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  item jsonb;
  affected int;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    UPDATE public.products
    SET stock = stock - (item->>'quantity')::int
    WHERE id = (item->>'productId')::uuid
      AND stock >= (item->>'quantity')::int;

    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected = 0 THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK:%', item->>'productId';
    END IF;
  END LOOP;
END;
$$;

-- Compensating release for a reservation that must be undone (e.g. order creation
-- failed after stock was already reserved). No floor check needed — it only ever
-- reverses quantities this same checkout just reserved.
CREATE OR REPLACE FUNCTION public.release_product_stock(items jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    UPDATE public.products
    SET stock = stock + (item->>'quantity')::int
    WHERE id = (item->>'productId')::uuid;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reserve_product_stock(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_product_stock(jsonb) TO service_role;
