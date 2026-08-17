-- 20260814020000 tried to fix "column reference product_slug is ambiguous" by
-- qualifying the two ON CONFLICT ... WHERE predicates with
-- public.cart_items.<col> — verified against the live database via a direct
-- RPC call and it still fails with the same 42702 error. The conflict target
-- column list itself, `ON CONFLICT (cart_id, product_slug)`, is also resolved
-- against the function's RETURNS TABLE-declared OUT variables and can't be
-- qualified (conflict_target only accepts bare column names per the INSERT
-- grammar), so per-reference qualification can't fully close this.
--
-- The documented fix for a PL/pgSQL function whose OUT parameters
-- (RETURNS TABLE columns, here product_id/product_slug/quantity/name/price/
-- currency/image_url) collide with the names of columns on a table the
-- function reads or writes is the `#variable_conflict` compiler pragma:
-- forces every bare identifier in the function body to resolve to the table
-- column over the matching OUT variable, everywhere, including the
-- ON CONFLICT target list. Verified fixed against the live database (see
-- report) before landing this migration.
CREATE OR REPLACE FUNCTION public.upsert_cart_items(p_user_id uuid, p_items jsonb)
RETURNS TABLE (
  product_id uuid,
  product_slug text,
  quantity integer,
  name text,
  price numeric,
  currency text,
  image_url text
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
DECLARE
  v_cart_id uuid;
  item jsonb;
BEGIN
  INSERT INTO public.carts (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT id INTO v_cart_id FROM public.carts WHERE user_id = p_user_id;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF (item->>'productId') IS NOT NULL THEN
      INSERT INTO public.cart_items (cart_id, product_id, quantity, name, price, currency, image_url)
      VALUES (
        v_cart_id,
        (item->>'productId')::uuid,
        (item->>'quantity')::int,
        item->>'name',
        (item->>'price')::numeric,
        COALESCE(item->>'currency', 'KGS'),
        item->>'imageUrl'
      )
      ON CONFLICT (cart_id, product_id) WHERE product_id IS NOT NULL
      DO UPDATE SET
        quantity = public.cart_items.quantity + EXCLUDED.quantity,
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        currency = EXCLUDED.currency,
        image_url = EXCLUDED.image_url,
        updated_at = now();
    ELSE
      INSERT INTO public.cart_items (cart_id, product_slug, quantity, name, price, currency, image_url)
      VALUES (
        v_cart_id,
        item->>'productSlug',
        (item->>'quantity')::int,
        item->>'name',
        (item->>'price')::numeric,
        COALESCE(item->>'currency', 'KGS'),
        item->>'imageUrl'
      )
      ON CONFLICT (cart_id, product_slug) WHERE product_id IS NULL AND product_slug IS NOT NULL
      DO UPDATE SET
        quantity = public.cart_items.quantity + EXCLUDED.quantity,
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        currency = EXCLUDED.currency,
        image_url = EXCLUDED.image_url,
        updated_at = now();
    END IF;
  END LOOP;

  UPDATE public.carts SET updated_at = now() WHERE id = v_cart_id;

  RETURN QUERY
  SELECT ci.product_id, ci.product_slug, ci.quantity, ci.name, ci.price, ci.currency, ci.image_url
  FROM public.cart_items ci
  WHERE ci.cart_id = v_cart_id
  ORDER BY ci.created_at;
END;
$$;
