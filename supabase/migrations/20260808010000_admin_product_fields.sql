-- Admin Catalog product management (Промпт №1, new series): adds the
-- product-card fields the admin form collects that don't exist yet.
-- Additive/nullable only — no existing column, constraint, or row is
-- touched, so seller/customer product paths are unaffected.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS manufacturer TEXT,
  ADD COLUMN IF NOT EXISTS country_of_origin TEXT,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';
