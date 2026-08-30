-- Задача №212 — dedicated cash-collection timestamp/actor, separate from
-- the generic paid_at (also set by the ONLINE/Finik webhook path, see
-- 20260802030000_order_courier_assignment.sql's sibling payment migrations)
-- so "cash collected today" aggregation for the admin courier card doesn't
-- conflate cash-in-hand with online payments confirmed the same day.
ALTER TABLE public.orders ADD COLUMN cash_collected_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN cash_collected_by UUID REFERENCES auth.users(id);

-- Supports both the admin courier-card "sum collected today" query
-- (WHERE cash_collected_by = ? AND cash_collected_at >= ?) and any future
-- lookup of a single order's collection record.
CREATE INDEX idx_orders_cash_collected_by_at
  ON public.orders(cash_collected_by, cash_collected_at)
  WHERE cash_collected_at IS NOT NULL;
