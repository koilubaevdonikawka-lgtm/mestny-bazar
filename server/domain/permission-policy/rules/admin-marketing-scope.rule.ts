import type { PermissionContext, PermissionResult } from "@server/ports/permission-policy.port";
import type { PermissionPolicyRule } from "@server/domain/permission-policy/permission-policy.rule";
import { PermissionPolicyOrder } from "@server/domain/permission-policy/permission-policy-order";

/** ADMIN_PLATFORM_MASTER_SPEC.md §8 access matrix — modules an admin-marketing scope may reach. */
const MARKETING_ALLOWED_MODULES = [
  "dashboard",
  "catalog",
  "analytics",
  "marketing",
  "design",
  "automation",
  "ai",
  // docs/delivery/DELIVERY_MASTER_SPEC.md §5 — Admin-Marketing manages Delivery
  // Tariffs (seasonal/promotional pricing campaigns). This is a module-level
  // grant like every other entry here — the same coarse granularity already
  // used for Marketing (coupons) — not restricted to specific tariffType
  // values; see the module's own doc for why finer-grained scoping isn't
  // implemented (it would be a new permission mechanism, not a reuse of this
  // one).
  "delivery",
];

/**
 * Narrows an admin carrying the "marketing" scope (permissions.md) to a fixed module
 * allowlist — runs before AdminFullAccessRule, only applies when the actor actually
 * has a scope, so a plain (unscoped) admin's access is completely unaffected.
 */
export class AdminMarketingScopeRule implements PermissionPolicyRule {
  readonly order = PermissionPolicyOrder.ADMIN_SCOPE_RESTRICTION;

  applies(context: PermissionContext): boolean {
    return context.actor.roles.includes("admin") && !!context.actor.scopes?.includes("marketing");
  }

  evaluate(context: PermissionContext): PermissionResult {
    if (MARKETING_ALLOWED_MODULES.includes(context.module)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      denialCode: "OUT_OF_SCOPE",
      message: `admin-marketing scope does not include module "${context.module}"`,
    };
  }
}
