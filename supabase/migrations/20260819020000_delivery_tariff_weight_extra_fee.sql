-- Весовая доставка — доплата за килограмм по городу/зоне (продолжение
-- этапа "весовая доставка"): для Канта +2 сом/кг вместо стандартных +1.
-- Deliberately a new, dedicated column rather than reusing price_per_km —
-- that field is a different unit (сом per kilometre of BY_DISTANCE travel,
-- still unused today but earmarked for a real future re-activation, see
-- delivery-future-roadmap.md) and reusing it here would collide with its
-- existing meaning the moment BY_DISTANCE is switched on.
-- Nullable: existing tariffs (Центр, Пригород) need no manual backfill —
-- DeliveryCalculator treats a null value as the pre-existing default (1
-- som/kg), so this migration changes no existing tariff's behavior.
ALTER TABLE public.delivery_tariffs
  ADD COLUMN IF NOT EXISTS weight_extra_fee_per_kg NUMERIC(10, 2);

COMMENT ON COLUMN public.delivery_tariffs.weight_extra_fee_per_kg IS
  'Доплата (сом) за каждый дополнительный килограмм сверх включённых 40 кг в формуле весовой доставки (server/domain/delivery-calculator.ts). NULL = использовать дефолт (1 сом/кг). Не то же самое, что price_per_km (BY_DISTANCE, другая единица измерения).';
