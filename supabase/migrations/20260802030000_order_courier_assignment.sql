-- Closes couriers.md's documented gap: OrderDTO had no field linking an order to a
-- specific courier, so CourierOrderService.listDeliveryOrders() returned the same shared
-- queue to every courier ("first to accept wins") — contradicting the already-accepted
-- decision that the system auto-selects the most suitable courier per order.
ALTER TABLE public.orders ADD COLUMN assigned_courier_id UUID REFERENCES auth.users(id);
CREATE INDEX idx_orders_assigned_courier ON public.orders(assigned_courier_id);

-- Minimal courier-in-the-moment state needed for assignment (couriers.md §"Требуемая
-- модель данных"). Geolocation columns are intentionally omitted — not required by any
-- assignment rule implemented in this stage (see LeastLoadedAvailableCourierRule).
CREATE TABLE public.courier_status (
  courier_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.courier_status TO authenticated;
GRANT ALL ON public.courier_status TO service_role;
ALTER TABLE public.courier_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courier_status_select_own" ON public.courier_status
  FOR SELECT TO authenticated USING (auth.uid() = courier_id);
CREATE POLICY "courier_status_select_admin" ON public.courier_status
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "courier_status_insert_own" ON public.courier_status
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = courier_id);
CREATE POLICY "courier_status_update_own" ON public.courier_status
  FOR UPDATE TO authenticated USING (auth.uid() = courier_id) WITH CHECK (auth.uid() = courier_id);
