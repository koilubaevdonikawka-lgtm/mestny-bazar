import type { PermissionContext, PermissionResult } from "@server/ports/permission-policy.port";
import type { PermissionPolicyRule } from "@server/domain/permission-policy/permission-policy.rule";
import { PermissionPolicyOrder } from "@server/domain/permission-policy/permission-policy-order";

/**
 * Stage 1 baseline: the `admin` role has full access to every Admin Platform
 * module, every other actor is denied. No sub-roles exist yet (see
 * docs/admin-platform/permissions.md) — this is the single rule Stage 1
 * ships; role-scoped rules (warehouse/seller/admin sub-roles) are added in
 * later stages without restructuring the engine itself.
 */
export class AdminFullAccessRule implements PermissionPolicyRule {
  readonly order = PermissionPolicyOrder.ADMIN_FULL_ACCESS;

  applies(_context: PermissionContext): boolean {
    return true;
  }

  evaluate(context: PermissionContext): PermissionResult {
    if (context.actor.roles.includes("admin")) {
      return { allowed: true };
    }

    return {
      allowed: false,
      denialCode: "ADMIN_ROLE_REQUIRED",
      message: "Admin role is required to access this module",
    };
  }
}
