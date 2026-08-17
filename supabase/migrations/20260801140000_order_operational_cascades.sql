-- Idempotency marker for the buffer-as-gate operational cascade
-- (docs/admin-platform/platform-lifecycle.md, §3). The platform runs on
-- Cloudflare Workers with no scheduler/cron/durable-object infrastructure, so
-- "trigger once, 2 minutes after order.created_at" is implemented as a
-- lazy, server-computed sweep (same pattern as the customer cancellation
-- window: isWithinCancellationWindow(order.createdAt, Date.now())) run on
-- staff-facing order reads, not a background timer. This table is the
-- atomic claim that makes repeated sweeps over the same order idempotent —
-- "INSERT ... ON CONFLICT DO NOTHING" lets exactly one caller win the race
-- and publish order.operational_cascade_started exactly once.
CREATE TABLE public.order_operational_cascades (
  order_id UUID PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Server-only bookkeeping table, same pattern as audit_log: written
-- exclusively via supabaseAdmin, no client-facing read path.
GRANT ALL ON public.order_operational_cascades TO service_role;
ALTER TABLE public.order_operational_cascades ENABLE ROW LEVEL SECURITY;
