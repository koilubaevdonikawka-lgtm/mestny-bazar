import {
  adminRoleHasPermission,
  type AdminRole,
} from "@server/application/modules/administration/administration/models";

export const AdministrationPermission = {
  ManageSettings: "permissions.manage",
  ManageRoles: "permissions.manage",
  ManageFeatureFlags: "permissions.manage",
  SetMaintenanceMode: "permissions.manage",
  ViewAudit: "audit.view",
} as const;

const KNOWN_PERMISSIONS = Object.freeze([
  "product.create",
  "product.update",
  "product.delete",
  "catalog.manage",
  "seller.verify",
  "seller.block",
  "order.create",
  "order.cancel",
  "order.refund",
  "user.manage",
  "audit.view",
  "permissions.manage",
]);

/** Validates administrative actions against stored roles and permission keys. */
export class AdministrationPolicy {
  assertCanManagePlatform(actorId: string, roles: readonly AdminRole[]): void {
    if (!this.canManagePlatform(actorId, roles)) {
      throw new Error(`Actor ${actorId} is not allowed to manage platform settings`);
    }
  }

  canManagePlatform(actorId: string, roles: readonly AdminRole[]): boolean {
    if (actorId.trim() === "system") {
      return true;
    }
    if (roles.length === 0) {
      return true;
    }
    return roles.some(
      (role) =>
        adminRoleHasPermission(role, AdministrationPermission.ManageSettings) ||
        adminRoleHasPermission(role, AdministrationPermission.ViewAudit),
    );
  }

  assertValidRolePermissions(permissions: readonly string[]): void {
    for (const permission of permissions) {
      const normalized = permission.trim();
      if (!normalized) {
        throw new Error("Permission key must not be empty");
      }
      if (!KNOWN_PERMISSIONS.includes(normalized)) {
        throw new Error(`Unknown permission key: ${normalized}`);
      }
    }
  }

  assertUniqueRoleName(name: string, existingRoles: readonly AdminRole[], roleId?: string): void {
    const normalized = name.trim().toLowerCase();
    const duplicate = existingRoles.find(
      (role) => role.name.trim().toLowerCase() === normalized && role.id !== roleId?.trim(),
    );
    if (duplicate) {
      throw new Error(`Admin role already exists: ${name}`);
    }
  }
}
