-- Delivery Tariff (docs/delivery/delivery-pricing.md) — price/free_from move
-- OFF delivery_zones onto this new, independent entity so a zone can carry
-- more than one tariff (STANDARD + HOLIDAY + CORPORATE + PROMOTIONAL) at once
-- — the architectural point of this migration, not a rename.
CREATE TYPE public.delivery_tariff_type AS ENUM ('STANDARD', 'HOLIDAY', 'CORPORATE', 'PROMOTIONAL');
CREATE TYPE public.delivery_pricing_model AS ENUM ('FIXED', 'BY_ZONE', 'BY_DISTANCE');

CREATE TABLE public.delivery_tariffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- NULL = platform-wide default tariff, used when a zone has no tariff of
  -- its own (delivery-pricing.md, "Delivery Tariff" table).
  zone_id UUID REFERENCES public.delivery_zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tariff_type public.delivery_tariff_type NOT NULL DEFAULT 'STANDARD',
  pricing_model public.delivery_pricing_model NOT NULL DEFAULT 'FIXED',
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  price_per_km NUMERIC(10,2) CHECK (price_per_km IS NULL OR price_per_km >= 0),
  min_order_for_free_delivery NUMERIC(10,2) CHECK (min_order_for_free_delivery IS NULL OR min_order_for_free_delivery >= 0),
  min_order_amount NUMERIC(10,2) CHECK (min_order_amount IS NULL OR min_order_amount >= 0),
  eta_min_minutes INT CHECK (eta_min_minutes IS NULL OR eta_min_minutes >= 0),
  eta_max_minutes INT CHECK (eta_max_minutes IS NULL OR eta_max_minutes >= 0),
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  -- Explicit priority for DeliveryTariffPolicyService (Rule Engine, Принцип
  -- 12) — never a magic-number ordering guess inside the service itself
  -- (delivery-rule-engine.md, DeliveryTariffPolicyOrder).
  priority INT NOT NULL DEFAULT 90,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_tariffs_zone ON public.delivery_tariffs(zone_id);
CREATE INDEX idx_delivery_tariffs_type ON public.delivery_tariffs(tariff_type);

GRANT SELECT ON public.delivery_tariffs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.delivery_tariffs TO authenticated;
GRANT ALL ON public.delivery_tariffs TO service_role;
ALTER TABLE public.delivery_tariffs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_delivery_tariffs_updated BEFORE UPDATE ON public.delivery_tariffs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "delivery_tariffs_public_read" ON public.delivery_tariffs
  FOR SELECT USING (is_active = true OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "delivery_tariffs_admin_write" ON public.delivery_tariffs
  FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- Migration path (delivery-pricing.md, "Миграция с текущей модели"): every
-- existing zone's price/free_from becomes exactly one STANDARD/FIXED tariff
-- row, priority 90 (DeliveryTariffPolicyOrder.STANDARD_FALLBACK) — no data
-- lost, no observable behavior change until a second tariff is created.
INSERT INTO public.delivery_tariffs (zone_id, name, tariff_type, pricing_model, base_price, min_order_for_free_delivery, priority, is_active)
SELECT id, 'Стандартный', 'STANDARD', 'FIXED', price, free_from, 90, is_active
FROM public.delivery_zones;

ALTER TABLE public.delivery_zones DROP COLUMN price;
ALTER TABLE public.delivery_zones DROP COLUMN free_from;
