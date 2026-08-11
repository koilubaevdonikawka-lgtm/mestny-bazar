-- Full online-payment system (Промпт №075). Closes the gap found in
-- Промпт №074's audit: ONLINE was a live, selectable checkout option that
-- silently went nowhere (CheckoutPaymentHandler never called the payment
-- provider, FinikPaymentAdapter threw "not implemented" on every method).
-- `payments` is the durable idempotency store + payment record for the
-- provider-orchestrated flow; `payment_events` is the payment audit log —
-- every step of the 15-step payment lifecycle gets a row here.
CREATE TYPE public.payment_record_status AS ENUM (
  'pending', 'awaiting', 'paid', 'failed', 'expired', 'refunded'
);

CREATE TYPE public.payment_event_type AS ENUM (
  'created', 'redirect_issued', 'webhook_received', 'signature_invalid',
  'confirmed', 'failed', 'expired', 'status_rechecked', 'rollback'
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  provider TEXT NOT NULL DEFAULT 'finik',
  provider_payment_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL,
  status public.payment_record_status NOT NULL DEFAULT 'pending',
  payment_url TEXT,
  expires_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order_id ON public.payments(order_id);
-- Partial unique index: multiple payments can share a NULL provider_payment_id
-- (before the provider has responded), but once set it must be unique.
CREATE UNIQUE INDEX idx_payments_provider_payment_id ON public.payments(provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

CREATE TABLE public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type public.payment_event_type NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_events_payment_id ON public.payment_events(payment_id);

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.payment_events TO authenticated;
GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Admin-only read; all writes are server-orchestrated via service_role only
-- (payments are never written directly by a customer/client — the entire
-- flow goes through PaymentService on the server, matching how orders
-- themselves are never client-writable either).
CREATE POLICY "payments_select_admin" ON public.payments
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "payment_events_select_admin" ON public.payment_events
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
