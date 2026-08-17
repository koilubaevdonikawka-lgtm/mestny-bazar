-- Seller role and product ownership for seller panel
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'seller';

-- SQLSTATE 55P04 ("unsafe use of new value of enum type"): a value added by
-- ALTER TYPE ... ADD VALUE cannot be read/compared until that add is committed.
-- This file runs as a single transaction, so the explicit COMMIT below closes
-- that transaction right after the enum change; everything after it (which
-- reads the new 'seller' value) runs in a fresh transaction where it is safe.
COMMIT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);

DROP POLICY IF EXISTS "products_seller_own" ON public.products;
CREATE POLICY "products_seller_own" ON public.products
  FOR ALL TO authenticated
  USING (seller_id = auth.uid() AND private.has_role(auth.uid(), 'seller'))
  WITH CHECK (seller_id = auth.uid() AND private.has_role(auth.uid(), 'seller'));
