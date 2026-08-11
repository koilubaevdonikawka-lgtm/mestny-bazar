import { PermissionDeniedError } from "@server/domain/permission-policy/permission-policy.errors";
import { getServices } from "@server/di/container";
import type { RbacAction, RbacModule } from "@shared/contracts/rbac";

/**
 * Second line of defense used ONLY by the new/touched code paths introduced
 * in Промпт №068 (Couriers, Permissions' own mutations, the courier-context
 * branch of image upload) — additive and parallel to
 * PermissionPolicyService/admin_scopes, which every other pre-existing admin
 * executor keeps using unchanged. Always called AFTER
 * requireAdminFromRequest(), never standalone — every actor must still hold
 * the legacy "admin" role before this fine-grained check even runs.
 *
 * Stable, generic primitive from day one: migrating an existing module onto
 * RBAC later means adding one call like this to that module's executor —
 * nothing here changes.
 */
export async function requireModulePermission(
  userId: string,
  module: RbacModule | string,
  action: RbacAction | string,
): Promise<void> {
  const allowed = await getServices().rbacService.hasPermission(userId, module, action);
  if (!allowed) {
    throw new PermissionDeniedError(
      "MODULE_PERMISSION_DENIED",
      `Permission denied: missing '${action}' on module '${module}'`,
    );
  }
}
