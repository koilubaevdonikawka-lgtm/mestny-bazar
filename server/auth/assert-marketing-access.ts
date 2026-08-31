import type { UserRole } from "@shared/contracts/user";
import { getServices } from "@server/di/container";

const MODULE = "marketing";

/**
 * Задача №219 — single shared implementation of the correct three-step
 * scope check (user-admin.executor.ts's own pattern: look up the acting
 * admin's real admin_scopes and actually pass them into the policy check)
 * for every "marketing" module executor — coupons, banners, push broadcast,
 * and the banner-image-upload branch of media-upload.executor.ts. Replaces
 * the shortcut most of those previously used (`assert({actor: {id, roles}})`
 * with no `scopes` — permission-policy.port.ts's own documented gap, where
 * AdminMarketingScopeRule.applies() can never fire because `scopes` is
 * always undefined, so the check degrades to "has the admin role", not
 * "holds the marketing scope"). One shared function means "unified pattern"
 * is enforced structurally, not just by convention across four call sites.
 */
export async function assertMarketingAccess(userId: string, roles: UserRole[]): Promise<void> {
  const actor = await getServices().userAdminService.getUser(userId);
  getServices().permissionPolicy.assert({
    actor: { id: userId, roles, scopes: actor?.adminScopes },
    module: MODULE,
  });
}
