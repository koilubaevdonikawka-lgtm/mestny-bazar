import {
  createAdminPermission,
  normalizeAdminPermissions,
  type AdminPermission,
} from "@server/application/modules/administration/administration/models/admin-permission.model";

/** Administrative role with permission grants. */
export interface AdminRole {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly permissions: readonly AdminPermission[];
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createAdminRole(input: {
  id: string;
  name: string;
  permissions: readonly string[];
  description?: string | null;
}): AdminRole {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    description: input.description?.trim() || null,
    permissions: normalizeAdminPermissions(input.permissions),
    active: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withAdminRoleUpdate(
  role: AdminRole,
  input: {
    name?: string;
    permissions?: readonly string[];
    description?: string | null;
    active?: boolean;
  },
): AdminRole {
  return Object.freeze({
    ...role,
    name: input.name?.trim() || role.name,
    description:
      input.description === undefined ? role.description : input.description?.trim() || null,
    permissions:
      input.permissions === undefined
        ? role.permissions
        : normalizeAdminPermissions(input.permissions),
    active: input.active ?? role.active,
    updatedAt: new Date().toISOString(),
  });
}

export function adminRoleHasPermission(role: AdminRole, permissionKey: string): boolean {
  if (!role.active) {
    return false;
  }
  return role.permissions.some(
    (permission) => permission.key === permissionKey.trim() && permission.granted,
  );
}

export { createAdminPermission };
