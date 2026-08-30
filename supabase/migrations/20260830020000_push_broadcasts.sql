-- Задача №218 — history/audit trail for admin mass-push broadcasts
-- ("Массовая рассылка push", admin/marketing), and the source of truth for
-- the server-side cooldown that guards against an accidental repeat send
-- (the most recent row's created_at is checked before allowing a new one).
CREATE TABLE public.push_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  recipient_count INTEGER NOT NULL,
  sent_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_broadcasts_created_at ON public.push_broadcasts(created_at DESC);

-- Admin-only data (server-side, service role) — no direct client access,
-- same as delivery_tariffs/device_tokens' service-role-only write path.
GRANT ALL ON public.push_broadcasts TO service_role;
ALTER TABLE public.push_broadcasts ENABLE ROW LEVEL SECURITY;
