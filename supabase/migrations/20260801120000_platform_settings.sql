-- Business-configurable platform settings (Admin Platform, Stage 1: infrastructure
-- only — no specific setting is read by any domain service yet). Deliberately
-- separate from server/config/env.ts, which remains the source of truth for
-- secrets and infrastructure config — see docs/admin-platform/settings.md for
-- the split rationale (secrets/infra stay env vars; business-editable values
-- live here). Nothing in this migration moves an existing hardcode into this
-- table yet; that is scoped to later Admin Platform stages per
-- docs/admin-platform/IMPLEMENTATION_ORDER.md.
CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  category text NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Server-only in practice: written and read exclusively via supabaseAdmin
-- (service_role bypasses RLS), matching audit_log's convention. This
-- authenticated-admin read policy is defense-in-depth, not a client-facing
-- path — the Platform Layer principle forbids the frontend from querying
-- Supabase directly regardless of what RLS would otherwise allow.
CREATE POLICY "platform_settings_admin_read" ON public.platform_settings
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

GRANT ALL ON public.platform_settings TO service_role;
