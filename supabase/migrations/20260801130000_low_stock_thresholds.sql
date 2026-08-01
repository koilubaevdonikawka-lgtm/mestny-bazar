-- Per-product low-stock threshold override (docs/admin-platform/warehouse.md).
-- NULL means "use the platform default" (StockPolicyService's LowStockThresholdRule),
-- not "no threshold" — a warehouse manager can override it per product without
-- a code change, per the module's own architectural requirement.
ALTER TABLE public.products ADD COLUMN low_stock_threshold INT;
ALTER TABLE public.products
  ADD CONSTRAINT products_low_stock_threshold_non_negative
  CHECK (low_stock_threshold IS NULL OR low_stock_threshold >= 0);
