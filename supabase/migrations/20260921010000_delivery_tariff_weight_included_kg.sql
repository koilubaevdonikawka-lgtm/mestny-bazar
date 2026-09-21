-- Задача №296 — порог веса (сколько кг покрывает базовая цена доставки) делается
-- редактируемым полем тарифа, как базовая цена (base_price) и доплата за кг
-- (weight_extra_fee_per_kg). Раньше порог был зашит в
-- server/domain/delivery-calculator.ts (40 кг).
-- Nullable: NULL = дефолт 40 кг, поэтому ни один существующий тариф не требует
-- заполнения и поведение расчёта после миграции не меняется.
ALTER TABLE public.delivery_tariffs
  ADD COLUMN IF NOT EXISTS weight_included_kg NUMERIC(10, 2)
  CHECK (weight_included_kg IS NULL OR weight_included_kg >= 0);

COMMENT ON COLUMN public.delivery_tariffs.weight_included_kg IS
  'Вес заказа (кг), который покрывает base_price; каждый следующий (округляется вверх) кг добавляет weight_extra_fee_per_kg. NULL = использовать дефолт (40 кг). См. server/domain/delivery-calculator.ts.';
