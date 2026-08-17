import type {
  IDiscountPolicy,
  DiscountPolicyContext,
  DiscountPolicyResult,
} from "@server/ports/discount-policy.port";
import type { DiscountPolicyRule } from "@server/domain/discount-policy/discount-policy.rule";
import { DiscountPolicyDeniedError } from "@server/domain/discount-policy.errors";

function sortRulesByOrder(rules: DiscountPolicyRule[]): DiscountPolicyRule[] {
  return [...rules].sort((a, b) => a.order - b.order);
}

/**
 * Universal Rule Engine standard (Принцип 12), same shape as
 * PaymentPolicyService/PermissionPolicyService: !allowed denies immediately
 * regardless of terminal; allowed && terminal !== false stops the chain.
 */
export class DiscountPolicyService implements IDiscountPolicy {
  private readonly rules: DiscountPolicyRule[];

  constructor(rules: DiscountPolicyRule[]) {
    this.rules = sortRulesByOrder(rules);
  }

  evaluate(context: DiscountPolicyContext): DiscountPolicyResult {
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
      message: "No discount rule matched this coupon",
      discountAmount: 0,
    };
  }

  assertAndCompute(context: DiscountPolicyContext): DiscountPolicyResult {
    const result = this.evaluate(context);
    if (!result.allowed) {
      throw new DiscountPolicyDeniedError(
        result.denialCode ?? "DISCOUNT_POLICY_DENIED",
        result.message ?? "Coupon is not valid for this order",
      );
    }
    return result;
  }
}
