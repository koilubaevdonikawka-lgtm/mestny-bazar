-- District (docs/delivery/delivery-zones.md, "District") — finer-grain than
-- Zone. Schema-level foundation for Этап 3's address-to-zone auto-resolution
-- (delivery-zones.md, "Сопоставление адреса с зоной") — this migration only
-- establishes the entity; no application code reads/writes it yet (honestly
-- documented, not a silent gap — see docs/delivery/IMPLEMENTATION_ORDER.md).
CREATE TABLE public.delivery_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.delivery_zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_districts_zone ON public.delivery_districts(zone_id);

GRANT SELECT ON public.delivery_districts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.delivery_districts TO authenticated;
GRANT ALL ON public.delivery_districts TO service_role;
ALTER TABLE public.delivery_districts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_delivery_districts_updated BEFORE UPDATE ON public.delivery_districts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "delivery_districts_public_read" ON public.delivery_districts
  FOR SELECT USING (is_active = true OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "delivery_districts_admin_write" ON public.delivery_districts
  FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
