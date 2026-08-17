import type {
  ICommissionPolicy,
  CommissionPolicyContext,
  CommissionPolicyResult,
} from "@server/ports/commission-policy.port";
import type { CommissionPolicyRule } from "@server/domain/commission-policy/commission-policy.rule";
import { DEFAULT_COMMISSION_RATE } from "@server/domain/commission-policy/commission-policy-order";

function sortRulesByOrder(rules: CommissionPolicyRule[]): CommissionPolicyRule[] {
  return [...rules].sort((a, b) => a.order - b.order);
}

/** Evaluates the commission rate via an ordered rule chain (Принцип 12). */
export class CommissionPolicyService implements ICommissionPolicy {
  private readonly rules: CommissionPolicyRule[];

  constructor(rules: CommissionPolicyRule[]) {
    this.rules = sortRulesByOrder(rules);
  }

  resolveRate(context: CommissionPolicyContext): CommissionPolicyResult {
    for (const rule of this.rules) {
      if (!rule.applies(context)) continue;

      const result = rule.evaluate(context);
      const isTerminal = rule.terminal !== false;
      if (isTerminal) return result;
    }

    return { rate: DEFAULT_COMMISSION_RATE };
  }
}
