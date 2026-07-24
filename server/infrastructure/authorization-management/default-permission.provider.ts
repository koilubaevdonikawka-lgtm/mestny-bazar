import type { IPermissionProvider } from "@server/application/authorization-management/contracts/permission-provider.contract";

const ROLE_PERMISSIONS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  admin: Object.freeze(["*"]),
  seller: Object.freeze(["products.read", "products.write", "orders.read"]),
  customer: Object.freeze(["products.read", "orders.read", "orders.create"]),
  support: Object.freeze(["orders.read", "orders.write", "customers.read"]),
});

/** Default in-memory permission resolver. */
export class DefaultPermissionProvider implements IPermissionProvider {
  async getPermissionsForUser(
    _userId: string,
    roles: readonly string[],
  ): Promise<readonly string[]> {
    const permissions = new Set<string>();

    for (const role of roles) {
      for (const permission of ROLE_PERMISSIONS[role] ?? []) {
        permissions.add(permission);
      }
    }

    return Object.freeze([...permissions]);
  }

  async hasPermission(
    userId: string,
    roles: readonly string[],
    directPermissions: readonly string[],
    permission: string,
  ): Promise<boolean> {
    return this.hasPermissions(userId, roles, directPermissions, [permission], true);
  }

  async hasPermissions(
    userId: string,
    roles: readonly string[],
    directPermissions: readonly string[],
    permissions: readonly string[],
    requireAll: boolean,
  ): Promise<boolean> {
    const effective = await this.getPermissionsForUser(userId, roles);
    const granted = new Set([...effective, ...directPermissions]);

    if (granted.has("*")) {
      return true;
    }

    if (requireAll) {
      return permissions.every((permission) => granted.has(permission));
    }

    return permissions.some((permission) => granted.has(permission));
  }
}
