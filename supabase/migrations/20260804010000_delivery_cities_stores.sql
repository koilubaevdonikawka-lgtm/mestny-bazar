-- Delivery Management & Pricing, Этап 2 (docs/delivery/). City/Store are the
-- geography foundation delivery_zones.city_id/store_id reference next
-- migration — additive, does not touch existing delivery_zones rows yet.
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'Asia/Bishkek',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cities TO authenticated;
GRANT ALL ON public.cities TO service_role;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_cities_updated BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "cities_public_read" ON public.cities
  FOR SELECT USING (is_active = true OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "cities_admin_write" ON public.cities
  FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- Store (docs/delivery/delivery-zones.md, "Store") — a future multi-store
-- origin point. delivery_zones.store_id (next migration) is nullable — no
-- store existing yet does not block zone creation, matching today's
-- single-store reality.
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stores_city ON public.stores(city_id);

GRANT SELECT ON public.stores TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_stores_updated BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "stores_public_read" ON public.stores
  FOR SELECT USING (is_active = true OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "stores_admin_write" ON public.stores
  FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- Seed exactly one city so existing delivery_zones rows (next migration) have
-- a valid, non-arbitrary city_id to backfill to — the platform serves Bishkek
-- today (docs/delivery/DELIVERY_MASTER_SPEC.md), this is not a guess.
INSERT INTO public.cities (name, slug, sort_order) VALUES ('Бишкек', 'bishkek', 1);
