-- Seller payouts (finance.md). Finance never writes to orders — it only reads
-- already-settled order state and produces its own new aggregate (a payout run
-- per seller per period). Reconciliation with the Finik provider is explicitly
-- blocked (finik.adapter.ts is a stub) and out of scope for this table.
CREATE TYPE public.payout_status AS ENUM ('PENDING', 'COMPLETED');

CREATE TABLE public.seller_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  gross_revenue NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,4) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  payout_amount NUMERIC(10,2) NOT NULL,
  status public.payout_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_seller_payouts_seller ON public.seller_payouts(seller_id);

GRANT SELECT, INSERT, UPDATE ON public.seller_payouts TO authenticated;
GRANT ALL ON public.seller_payouts TO service_role;
ALTER TABLE public.seller_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seller_payouts_admin_all" ON public.seller_payouts
  FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "seller_payouts_seller_read_own" ON public.seller_payouts
  FOR SELECT TO authenticated USING (seller_id = auth.uid());
