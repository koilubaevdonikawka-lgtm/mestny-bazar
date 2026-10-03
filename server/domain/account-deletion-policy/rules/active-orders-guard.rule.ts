import type {
  AccountDeletionContext,
  AccountDeletionPolicyResult,
} from "@server/ports/account-deletion-policy.port";
import type { AccountDeletionPolicyRule } from "@server/domain/account-deletion-policy/account-deletion-policy.rule";
import { AccountDeletionPolicyOrder } from "@server/domain/account-deletion-policy/account-deletion-policy-order";

/** Orders not yet DELIVERED or CANCELLED (TerminalStateGuardRule's terminal states) block deletion. */
export class ActiveOrdersGuardRule implements AccountDeletionPolicyRule {
  readonly order = AccountDeletionPolicyOrder.ACTIVE_ORDERS_GUARD;
  readonly terminal = false;

  applies(): boolean {
    return true;
  }

  evaluate(context: AccountDeletionContext): AccountDeletionPolicyResult {
    if (context.activeOrderCount > 0) {
      return {
        allowed: false,
        denialCode: "ACTIVE_ORDERS",
        message: "Finish or cancel active orders before deleting the account",
      };
    }
    return { allowed: true };
  }
}
