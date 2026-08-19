-- Weight-based delivery pricing (Этап: весовая доставка) — products need a
-- weight to compute the order's total weight server-side. Nullable: the
-- existing 7 products keep working unmodified and count as 0 kg toward the
-- delivery-fee calculation until an admin fills this in.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(10, 3);

COMMENT ON COLUMN public.products.weight_kg IS
  'Product weight in kilograms. Nullable — used only for the weight-based delivery fee formula; a null value counts as 0 kg.';
