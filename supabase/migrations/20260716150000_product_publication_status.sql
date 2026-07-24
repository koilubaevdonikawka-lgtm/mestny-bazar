-- Product publication lifecycle: DRAFT → PUBLISHED ↔ HIDDEN
CREATE TYPE public.product_publication_status AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS publication_status public.product_publication_status NOT NULL DEFAULT 'DRAFT';

UPDATE public.products
SET publication_status = 'PUBLISHED'
WHERE is_active = true;

UPDATE public.products
SET publication_status = 'HIDDEN'
WHERE is_active = false;

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT
  USING (publication_status = 'PUBLISHED' OR private.has_role(auth.uid(), 'admin'));
