import type {
  IPermissionPolicy,
  PermissionContext,
  PermissionResult,
} from "@server/ports/permission-policy.port";
import type { PermissionPolicyRule } from "@server/domain/permission-policy/permission-policy.rule";
import { PermissionDeniedError } from "@server/domain/permission-policy/permission-policy.errors";

function sortRulesByOrder(rules: PermissionPolicyRule[]): PermissionPolicyRule[] {
  return [...rules].sort((a, b) => a.order - b.order);
}

/**
 * Universal rule engine for Admin Platform module access — same standard as
 * OrderLifecycleService/PaymentPolicyService/ProductPublicationService
 * (docs/principles/12-rule-engine-standard.md). Second line of defense after
 * require<Role>FromRequest(); rule membership and order composed in DI Container.
 */
export class PermissionPolicyService implements IPermissionPolicy {
  private readonly rules: PermissionPolicyRule[];

  constructor(rules: PermissionPolicyRule[]) {
    this.rules = sortRulesByOrder(rules);
  }

  can(context: PermissionContext): PermissionResult {
    for (const rule of this.rules) {
      if (!rule.applies(context)) continue;

      const result = rule.evaluate(context);
      if (!result.allowed) return result;

      const isTerminal = rule.terminal !== false;
      if (isTerminal) return result;
    }

    return {
      allowed: false,
      denialCode: "NO_MATCHING_RULE",
      message: "No permission rule matched the requested module",
    };
  }

  assert(context: PermissionContext): void {
    const result = this.can(context);
    if (result.allowed) return;

    throw new PermissionDeniedError(
      result.denialCode ?? "PERMISSION_DENIED",
      result.message ?? "Access to this Admin Platform module is not allowed",
    );
  }
}
