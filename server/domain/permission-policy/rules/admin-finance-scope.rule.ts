import type { PermissionContext, PermissionResult } from "@server/ports/permission-policy.port";
import type { PermissionPolicyRule } from "@server/domain/permission-policy/permission-policy.rule";
import { PermissionPolicyOrder } from "@server/domain/permission-policy/permission-policy-order";

/** ADMIN_PLATFORM_MASTER_SPEC.md §8 access matrix — modules an admin-finance scope may reach. */
const FINANCE_ALLOWED_MODULES = [
  "dashboard",
  "orders",
  "analytics",
  "finance",
  "integrations",
  "logs",
];

/**
 * Narrows an admin carrying the "finance" scope (permissions.md) to a fixed module
 * allowlist — runs before AdminFullAccessRule, only applies when the actor actually
 * has a scope, so a plain (unscoped) admin's access is completely unaffected.
 */
export class AdminFinanceScopeRule implements PermissionPolicyRule {
  readonly order = PermissionPolicyOrder.ADMIN_SCOPE_RESTRICTION;

  applies(context: PermissionContext): boolean {
    return context.actor.roles.includes("admin") && !!context.actor.scopes?.includes("finance");
  }

  evaluate(context: PermissionContext): PermissionResult {
    if (FINANCE_ALLOWED_MODULES.includes(context.module)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      denialCode: "OUT_OF_SCOPE",
      message: `admin-finance scope does not include module "${context.module}"`,
    };
  }
}
