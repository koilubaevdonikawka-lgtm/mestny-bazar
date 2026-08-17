/**
 * Industrial RBAC (Промпт №068, "Права доступа") — additive and parallel to
 * the fixed app_role enum / PermissionPolicyService. Recommended default
 * vocabulary surfaced in the UI; NOT a DB-level constraint — rbac_permissions
 * is a real catalog table with full CRUD, these are just sensible defaults.
 */
export const RBAC_MODULES = [
  "dashboard",
  "orders",
  "catalog",
  "users",
  "couriers",
  "sellers",
  "suppliers",
  "marketing",
  "design",
  "automation",
  "ai",
  "delivery",
  "integrations",
  "logs",
  "settings",
  "security",
  "analytics",
  "finance",
  "permissions",
] as const;
export type RbacModule = (typeof RBAC_MODULES)[number];

export const RBAC_ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
  "export",
  "manage_settings",
] as const;
export type RbacAction = (typeof RBAC_ACTIONS)[number];

export interface RbacRoleDTO {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RbacPermissionDTO {
  id: string;
  module: string;
  action: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
}

export interface RoleWithPermissionsDTO extends RbacRoleDTO {
  permissions: RbacPermissionDTO[];
}

export interface UserRoleAssignmentDTO {
  userId: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string | null;
}

export interface UpdateRoleRequest {
  id: string;
  name?: string;
  description?: string | null;
}

export interface CreatePermissionRequest {
  module: string;
  action: string;
  description?: string | null;
}

export interface UpdatePermissionRequest {
  id: string;
  module?: string;
  action?: string;
  description?: string | null;
}

export interface SetRolePermissionsRequest {
  roleId: string;
  permissionIds: string[];
}

export interface AssignRoleRequest {
  userId: string;
  roleId: string;
}

export interface RevokeRoleRequest {
  userId: string;
  roleId: string;
}
