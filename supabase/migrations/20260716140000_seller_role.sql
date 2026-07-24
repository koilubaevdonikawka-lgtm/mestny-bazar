-- Seller role and product ownership for seller panel
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'seller';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);

DROP POLICY IF EXISTS "products_seller_own" ON public.products;
CREATE POLICY "products_seller_own" ON public.products
  FOR ALL TO authenticated
  USING (seller_id = auth.uid() AND private.has_role(auth.uid(), 'seller'))
  WITH CHECK (seller_id = auth.uid() AND private.has_role(auth.uid(), 'seller'));
