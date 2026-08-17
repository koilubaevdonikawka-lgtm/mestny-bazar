-- Platform cart (Stage 5): replaces the Shopify Cart API. Guests keep their
-- cart in localStorage only (no rows here); authenticated users get one cart
-- row that follows them across devices/sessions, mirroring the addresses
-- table's per-user ownership model.

CREATE TABLE public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'KGS',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Cart lines identify a product either by its platform UUID (products.id) or,
-- while the Shopify catalog is still live (Stage 9 not done), by its Shopify
-- handle / platform slug when no synced product row exists yet. Exactly one
-- of product_id/product_slug is set — mirrors CreateOrderItemRequest's
-- productId/productSlug flexibility (shared/contracts/order.ts), so a cart
-- line and an order line item share the same identity shape end to end.
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  product_slug text,
  quantity integer NOT NULL CHECK (quantity > 0),
  name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'KGS',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_identifier_required CHECK (product_id IS NOT NULL OR product_slug IS NOT NULL)
);

-- One line per product identity per cart — matches the existing client
-- cart's merge-by-variant behavior (adding an already-present item bumps
-- quantity instead of creating a second line).
CREATE UNIQUE INDEX cart_items_cart_product_id_idx
  ON public.cart_items (cart_id, product_id) WHERE product_id IS NOT NULL;
CREATE UNIQUE INDEX cart_items_cart_product_slug_idx
  ON public.cart_items (cart_id, product_slug) WHERE product_id IS NULL AND product_slug IS NOT NULL;

CREATE INDEX cart_items_cart_id_idx ON public.cart_items (cart_id);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carts_own" ON public.carts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL TO authenticated
  USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()))
  WITH CHECK (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));

-- Atomically get-or-create the user's cart, then upsert each item: increments
-- quantity if a line with the same product identity already exists, inserts
-- otherwise. Used for both single-item "add to cart" and multi-item
-- "merge guest cart on login" — a plain SELECT-then-INSERT/UPDATE from
-- application code would race two concurrent adds of the same product into
-- the same quantity bump, the same TOCTOU class already closed for stock
-- reservation (reserve_product_stock) and default-address selection
-- (set_default_address).
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

GRANT EXECUTE ON FUNCTION public.upsert_cart_items(uuid, jsonb) TO service_role;
