-- Product variant stock architecture (Stage 14, "остатки вариантов
-- товаров"). One new, additive table. Deliberately NOT a stock column on
-- product_variants itself (Stage 13's table) and NOT a change to the
-- existing products.stock / reserve_product_stock / release_product_stock
-- machinery — both are explicitly protected by this stage's own
-- requirements (item 6: don't alter the variants or catalog/warehouse
-- architecture). product_variant_stock is a one-to-one extension table
-- (variant_id is its own primary key, no surrogate id needed) mirroring the
-- exact pair of columns products already carries for stock (stock,
-- low_stock_threshold), so the existing StockPolicyService/
-- LowStockThresholdRule (server/domain/stock-policy) already governing
-- product-level low/depleted status can evaluate variant stock too,
-- completely unmodified — this is the "совместимость с существующим
-- складским учётом" requirement (item 3).
--
-- No reservation/movement RPCs are added here — this stage is architecture
-- only (item 4: no reservation, no automatic deduction, no checkout
-- integration, no warehouse movement journal). A future stage can add
-- reserve_variant_stock/release_variant_stock RPCs (mirroring
-- reserve_product_stock/release_product_stock exactly) against this same
-- table without any further schema change (item 5).
--
-- A variant_stock row does not exist automatically when a variant is
-- created (Stage 13's ProductVariantService.createVariant is untouched) —
-- stock tracking is opt-in per variant via VariantStockService
-- .initializeStock, so this migration cannot retroactively touch any
-- existing product_variants row either.

CREATE TABLE public.product_variant_stock (
  variant_id UUID PRIMARY KEY REFERENCES public.product_variants(id) ON DELETE CASCADE,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INTEGER CHECK (low_stock_threshold IS NULL OR low_stock_threshold >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_variant_stock TO authenticated;
GRANT ALL ON public.product_variant_stock TO service_role;

ALTER TABLE public.product_variant_stock ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_product_variant_stock_updated BEFORE UPDATE ON public.product_variant_stock
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Admin-only access, same as Stages 12/13's tables — no customer-facing
-- consumer, no warehouse UI, exists yet.
CREATE POLICY "product_variant_stock_select_admin" ON public.product_variant_stock
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
