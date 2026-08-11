-- Industrial RBAC (Промпт №068, "Права доступа"). Additive and parallel to
-- the existing app_role enum / user_roles / PermissionPolicyService — none of
-- that is touched. This is a new, independent role/permission system used
-- only by requireModulePermission(), wired in this pass only into the
-- Couriers module and this module's own actions (see server/auth/
-- require-module-permission.ts). Table names use an rbac_ prefix specifically
-- to avoid colliding with the pre-existing public.user_roles table.
CREATE TABLE public.rbac_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A real catalog table, not a fixed enum/CHECK list — permissions themselves
-- get full CRUD. is_system rows are the handful actually wired to a real
-- requireModulePermission(...) call in code (see below); everything else is
-- a plain, fully editable/deletable default.
CREATE TABLE public.rbac_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (module, action)
);

CREATE TABLE public.rbac_role_permissions (
  role_id UUID NOT NULL REFERENCES public.rbac_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.rbac_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE public.rbac_user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.rbac_roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_rbac_role_permissions_role ON public.rbac_role_permissions(role_id);
CREATE INDEX idx_rbac_user_roles_user ON public.rbac_user_roles(user_id);

GRANT SELECT ON public.rbac_roles, public.rbac_permissions, public.rbac_role_permissions, public.rbac_user_roles TO authenticated;
GRANT ALL ON public.rbac_roles, public.rbac_permissions, public.rbac_role_permissions, public.rbac_user_roles TO service_role;
ALTER TABLE public.rbac_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_user_roles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_rbac_roles_updated BEFORE UPDATE ON public.rbac_roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "rbac_roles_select_admin" ON public.rbac_roles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "rbac_permissions_select_admin" ON public.rbac_permissions
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "rbac_role_permissions_select_admin" ON public.rbac_role_permissions
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "rbac_user_roles_select_admin" ON public.rbac_user_roles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- Seed: 7 standard system roles
-- ============================================================================
INSERT INTO public.rbac_roles (name, description, is_system) VALUES
  ('Суперадминистратор', 'Полный доступ ко всем модулям, включая управление правами доступа', true),
  ('Администратор', 'Полный доступ ко всем модулям, кроме управления правами доступа', true),
  ('Менеджер', 'Операционное управление каталогом, заказами и партнёрами', true),
  ('Оператор', 'Обработка заказов и курьеров', true),
  ('Склад', 'Каталог и поставки', true),
  ('Курьер', 'Просмотр своих заказов в административной панели', true),
  ('Поддержка', 'Просмотр заказов и пользователей для консультаций', true);

-- ============================================================================
-- Seed: default permission catalog — 19 modules x 6 actions = 114 rows.
-- The (couriers, *) and (permissions, *) rows are marked is_system=true
-- because this pass wires real requireModulePermission(...) calls against
-- them; every other row is an ordinary, fully editable/deletable default.
-- ============================================================================
INSERT INTO public.rbac_permissions (module, action, is_system)
SELECT m.module, a.action,
  (m.module IN ('couriers', 'permissions'))
FROM unnest(ARRAY[
    'dashboard','orders','catalog','users','couriers','sellers','suppliers',
    'marketing','design','automation','ai','delivery','integrations','logs',
    'settings','security','analytics','finance','permissions'
  ]) AS m(module),
  unnest(ARRAY['view','create','edit','delete','export','manage_settings']) AS a(action);

-- ============================================================================
-- Seed: default role -> permission grants
-- ============================================================================

-- Суперадминистратор: everything.
INSERT INTO public.rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.rbac_roles r, public.rbac_permissions p
WHERE r.name = 'Суперадминистратор';

-- Администратор: everything except the "permissions" module.
INSERT INTO public.rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.rbac_roles r, public.rbac_permissions p
WHERE r.name = 'Администратор' AND p.module <> 'permissions';

-- Менеджер: view/create/edit/export on core business modules + dashboard view.
INSERT INTO public.rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.rbac_roles r, public.rbac_permissions p
WHERE r.name = 'Менеджер'
  AND p.module IN ('orders','catalog','users','couriers','sellers','suppliers','marketing','design','analytics')
  AND p.action IN ('view','create','edit','export');
INSERT INTO public.rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.rbac_roles r, public.rbac_permissions p
WHERE r.name = 'Менеджер' AND p.module = 'dashboard' AND p.action = 'view';

-- Оператор: view/edit on orders/couriers + view on dashboard/users/catalog.
INSERT INTO public.rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.rbac_roles r, public.rbac_permissions p
WHERE r.name = 'Оператор' AND p.module IN ('orders','couriers') AND p.action IN ('view','edit');
INSERT INTO public.rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.rbac_roles r, public.rbac_permissions p
WHERE r.name = 'Оператор' AND p.module IN ('dashboard','users','catalog') AND p.action = 'view';

-- Склад: view/create/edit on catalog/suppliers + view on dashboard/orders.
INSERT INTO public.rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.rbac_roles r, public.rbac_permissions p
WHERE r.name = 'Склад' AND p.module IN ('catalog','suppliers') AND p.action IN ('view','create','edit');
INSERT INTO public.rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.rbac_roles r, public.rbac_permissions p
WHERE r.name = 'Склад' AND p.module IN ('dashboard','orders') AND p.action = 'view';

-- Курьер: view-only — real courier work stays in the separate Courier PWA.
INSERT INTO public.rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.rbac_roles r, public.rbac_permissions p
WHERE r.name = 'Курьер' AND p.module IN ('dashboard','orders','couriers') AND p.action = 'view';

-- Поддержка: view-only.
INSERT INTO public.rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.rbac_roles r, public.rbac_permissions p
WHERE r.name = 'Поддержка' AND p.module IN ('orders','users','couriers','sellers') AND p.action = 'view';

-- ============================================================================
-- Critical bootstrap step: without this, the current Root Owner (and every
-- other existing admin) is locked out of Couriers/Permissions the instant
-- requireModulePermission starts being enforced, since rbac_user_roles
-- starts empty. Every other existing admin must be granted a role via the
-- new /admin/permissions UI right after this migration is applied.
-- ============================================================================
INSERT INTO public.rbac_user_roles (user_id, role_id)
SELECT po.user_id, cr.id
FROM public.platform_ownership po, public.rbac_roles cr
WHERE po.role = 'ROOT_OWNER' AND cr.name = 'Суперадминистратор';
