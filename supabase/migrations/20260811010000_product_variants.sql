-- Product variants architecture (Stage 13, "варианты товаров").
-- New, additive tables only — products/categories/attributes (Stage 12)
-- are untouched. product_variant_attribute_values is a deliberate sibling
-- of Stage 12's product_attribute_values (not a modification of it — Stage
-- 13 explicitly must not change the existing attributes architecture):
-- same shape, same typed-column-per-value_type design, but keyed by
-- variant_id instead of product_id. Reusing the same attributes/
-- attribute_values reference-data tables for a variant's own attribute set
-- (color, size, volume, weight, packaging, ...) is what lets any future
-- variant dimension be added purely as data (a new row in `attributes`) —
-- no schema change, matching item 4 of the stage.
-- publication_status reuses the existing product_publication_status enum
-- (Promt 103) rather than inventing a parallel one.

CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  -- Real inventory identifier — unique across the whole catalog, unlike the
  -- parent products.sku column (added in a prior stage, still unconstrained).
  sku TEXT NOT NULL UNIQUE,
  -- NULL = inherits the parent product's price/image; set = overrides it.
  price NUMERIC(10,2) CHECK (price IS NULL OR price >= 0),
  image_url TEXT,
  publication_status public.product_publication_status NOT NULL DEFAULT 'DRAFT',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);

-- A variant's own characteristic set (e.g. Color=Red, Size=L), built from
-- the same attributes/attribute_values catalog Stage 12 already defined.
-- Structurally identical to product_attribute_values on purpose — same
-- typed-value-per-row design, same single-value-populated CHECK — but a
-- separate table so Stage 12's table/port/service is not touched.
CREATE TABLE public.product_variant_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  value_text TEXT,
  value_number NUMERIC,
  value_boolean BOOLEAN,
  attribute_value_id UUID REFERENCES public.attribute_values(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (variant_id, attribute_id),
  CONSTRAINT product_variant_attribute_values_single_value CHECK (
    (CASE WHEN value_text IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN value_number IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN value_boolean IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN attribute_value_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);
CREATE INDEX idx_product_variant_attribute_values_variant ON public.product_variant_attribute_values(variant_id);
CREATE INDEX idx_product_variant_attribute_values_attribute ON public.product_variant_attribute_values(attribute_id);

GRANT SELECT ON public.product_variants, public.product_variant_attribute_values TO authenticated;
GRANT ALL ON public.product_variants, public.product_variant_attribute_values TO service_role;

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_attribute_values ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_product_variants_updated BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_product_variant_attribute_values_updated BEFORE UPDATE ON public.product_variant_attribute_values
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Admin-only access, same as Stage 12's tables — no customer-facing
-- consumer exists yet (item 5: no variant selection/display this stage).
CREATE POLICY "product_variants_select_admin" ON public.product_variants
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "product_variant_attribute_values_select_admin" ON public.product_variant_attribute_values
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
