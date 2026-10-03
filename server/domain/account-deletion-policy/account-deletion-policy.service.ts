import type {
  AccountDeletionContext,
  AccountDeletionPolicyResult,
  IAccountDeletionPolicy,
} from "@server/ports/account-deletion-policy.port";
import type { AccountDeletionPolicyRule } from "@server/domain/account-deletion-policy/account-deletion-policy.rule";

function sortRulesByOrder(rules: AccountDeletionPolicyRule[]): AccountDeletionPolicyRule[] {
  return [...rules].sort((a, b) => a.order - b.order);
}

/** Rule Engine standard (docs/principles/12-rule-engine-standard.md) applied to self-service account deletion. */
export class AccountDeletionPolicyService implements IAccountDeletionPolicy {
  private readonly rules: AccountDeletionPolicyRule[];

  constructor(rules: AccountDeletionPolicyRule[]) {
    this.rules = sortRulesByOrder(rules);
  }

  can(context: AccountDeletionContext): AccountDeletionPolicyResult {
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
      message: "No account deletion rule matched",
    };
  }
}
