-- AuditLogService (server/domain/audit-log) was in-memory only — every audit record
-- was lost on process restart, making the "audit log" a no-op in production. This
-- gives it real, server-only persistence (see the Supabase adapter added alongside).
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  actor_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_occurred_at ON public.audit_log(occurred_at DESC);

-- Server-only: written exclusively via supabaseAdmin (service_role bypasses RLS
-- anyway); no client-facing read path exists yet, so authenticated gets no grant.
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
