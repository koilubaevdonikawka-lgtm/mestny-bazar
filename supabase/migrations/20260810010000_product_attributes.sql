-- Product attributes architecture (Stage 12, "характеристики товаров").
-- New, additive tables only — nothing on products/categories is altered,
-- renamed, or removed. Attribute definitions (groups/attributes/value
-- options) are reference data; category_attributes and
-- product_attribute_values are the two link tables that attach that
-- reference data to the existing catalog. Admin-only access (RLS mirrors
-- the newer rbac_*/courier_profiles convention: SELECT for authenticated
-- admins, all writes via service_role only) since no customer-facing
-- consumer exists yet — a future display/filter stage adds a public-read
-- policy here, which is additive and does not require touching this
-- migration or any of these tables' structure.

CREATE TYPE public.attribute_value_type AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'LIST');

CREATE TABLE public.attribute_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- group_id is nullable/SET NULL: an attribute may be ungrouped, and a group
-- can be removed without cascading a destructive delete onto its attributes.
CREATE TABLE public.attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.attribute_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  value_type public.attribute_value_type NOT NULL,
  -- Единица измерения (кг, л, см, ...) — a display-only property of the
  -- attribute itself, orthogonal to value_type (applies mainly to NUMBER).
  unit TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Reserved for the filtering stage (item 6) — not read/written by any
  -- code this stage, but the column exists now so filtering doesn't need
  -- its own migration to distinguish filterable vs. display-only attributes.
  is_filterable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_attributes_group ON public.attributes(group_id);

-- Predefined option list for LIST-type attributes (e.g. "Цвет": Красный,
-- Синий, ...). Unused for TEXT/NUMBER/BOOLEAN attributes.
CREATE TABLE public.attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (attribute_id, value)
);
CREATE INDEX idx_attribute_values_attribute ON public.attribute_values(attribute_id);

-- Which attributes apply to which category (many-to-many); is_required
-- prepares the future product-editing UI without being enforced anywhere
-- yet (no product-write path is touched this stage — item 5).
CREATE TABLE public.category_attributes (
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (category_id, attribute_id)
);
CREATE INDEX idx_category_attributes_attribute ON public.category_attributes(attribute_id);

-- A product's actual attribute values. One typed column per value_type
-- (rather than a single text column) so a future NUMBER-range filter can
-- run a real numeric comparison/index instead of parsing text — chosen
-- specifically to satisfy item 6 (filtering, next stages) without a second
-- migration. attribute_value_id is only populated for LIST-type attributes
-- and points at attribute_values. The CHECK constraint keeps exactly one of
-- the four value slots populated per row (which slot is *correct* for a
-- given attribute's value_type is enforced in the domain service, since
-- that needs a cross-table lookup a CHECK constraint cannot express).
CREATE TABLE public.product_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  value_text TEXT,
  value_number NUMERIC,
  value_boolean BOOLEAN,
  attribute_value_id UUID REFERENCES public.attribute_values(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, attribute_id),
  CONSTRAINT product_attribute_values_single_value CHECK (
    (CASE WHEN value_text IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN value_number IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN value_boolean IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN attribute_value_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);
CREATE INDEX idx_product_attribute_values_product ON public.product_attribute_values(product_id);
CREATE INDEX idx_product_attribute_values_attribute ON public.product_attribute_values(attribute_id);

GRANT SELECT ON public.attribute_groups, public.attributes, public.attribute_values,
  public.category_attributes, public.product_attribute_values TO authenticated;
GRANT ALL ON public.attribute_groups, public.attributes, public.attribute_values,
  public.category_attributes, public.product_attribute_values TO service_role;

ALTER TABLE public.attribute_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_attribute_groups_updated BEFORE UPDATE ON public.attribute_groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_attributes_updated BEFORE UPDATE ON public.attributes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_product_attribute_values_updated BEFORE UPDATE ON public.product_attribute_values
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "attribute_groups_select_admin" ON public.attribute_groups
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "attributes_select_admin" ON public.attributes
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "attribute_values_select_admin" ON public.attribute_values
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "category_attributes_select_admin" ON public.category_attributes
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "product_attribute_values_select_admin" ON public.product_attribute_values
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
