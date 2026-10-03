import type { AccountDeletionPolicyResult } from "@server/ports/account-deletion-policy.port";
import type { AccountDeletionPolicyRule } from "@server/domain/account-deletion-policy/account-deletion-policy.rule";
import { AccountDeletionPolicyOrder } from "@server/domain/account-deletion-policy/account-deletion-policy-order";

/** Terminal allow: a plain customer account that passed every guard may delete itself. */
export class CustomerAccountRule implements AccountDeletionPolicyRule {
  readonly order = AccountDeletionPolicyOrder.CUSTOMER_ACCOUNT;

  applies(): boolean {
    return true;
  }

  evaluate(): AccountDeletionPolicyResult {
    return { allowed: true };
  }
}
