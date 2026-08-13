-- Fixes "column reference \"product_slug\" is ambiguous" in upsert_cart_items
-- (20260731180000_platform_cart.sql). The function's RETURNS TABLE(product_id,
-- product_slug, quantity, name, price, currency, image_url) implicitly
-- declares a PL/pgSQL variable per output column. The ON CONFLICT ... WHERE
-- partial-index predicates referenced product_id/product_slug unqualified,
-- which Postgres can't resolve between that OUT variable and the
-- cart_items column of the same name — exactly the collision the function
-- already worked around once, in the slug branch's
-- `quantity = public.cart_items.quantity + EXCLUDED.quantity`, but missed in
-- both ON CONFLICT predicates. Since the app only ever sends productSlug
-- (src/stores/cartStore.ts toIdentifier() never sets productId), every
-- authenticated add-to-cart hit the slug branch and failed with this error.
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
      ON CONFLICT (cart_id, product_id) WHERE public.cart_items.product_id IS NOT NULL
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
      ON CONFLICT (cart_id, product_slug) WHERE public.cart_items.product_id IS NULL AND public.cart_items.product_slug IS NOT NULL
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
