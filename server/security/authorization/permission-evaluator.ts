import type { SecurityContext } from "@server/security/context";
import type { Permission } from "@server/security/permissions";

/** Evaluates direct and effective permissions on a security context. */
export class PermissionEvaluator {
  hasPermission(context: SecurityContext, permission: Permission | string): boolean {
    return context.hasPermission(permission);
  }

  hasAllPermissions(context: SecurityContext, permissions: readonly Permission[]): boolean {
    return permissions.every((permission) => context.hasPermission(permission));
  }

  hasAnyPermission(context: SecurityContext, permissions: readonly Permission[]): boolean {
    return permissions.some((permission) => context.hasPermission(permission));
  }

  mergePermissions(
    direct: readonly Permission[],
    derived: readonly Permission[],
  ): readonly Permission[] {
    return Object.freeze([...new Set([...direct, ...derived])] as Permission[]);
  }
}
