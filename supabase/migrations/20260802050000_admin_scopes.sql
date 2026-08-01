-- permissions.md: admin-finance/admin-marketing are NOT new UserRole values (that would
-- break every existing roles.includes("admin") check across the codebase) — they are a
-- more granular scope layered on top of the existing admin role, read only by
-- PermissionPolicyService. A user still needs the "admin" role in user_roles; this table
-- only narrows what an admin-scoped rule additionally restricts them to.
CREATE TYPE public.admin_scope AS ENUM ('finance', 'marketing');

CREATE TABLE public.admin_scopes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope public.admin_scope NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, scope)
);

GRANT SELECT ON public.admin_scopes TO authenticated;
GRANT ALL ON public.admin_scopes TO service_role;
ALTER TABLE public.admin_scopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_scopes_select_own" ON public.admin_scopes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin_scopes_select_admin" ON public.admin_scopes
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
