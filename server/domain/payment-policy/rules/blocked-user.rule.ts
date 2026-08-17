import type { PaymentPolicyContext, PaymentPolicyResult } from "@server/ports/payment-policy.port";
import type { PaymentPolicyRule } from "@server/domain/payment-policy/payment-policy.rule";
import { PaymentPolicyOrder } from "@server/domain/payment-policy/payment-policy-order";

/**
 * Global guard (users.md): a blocked customer cannot place any order, regardless of
 * payment method. terminal: false so an unblocked user falls through to the
 * method-specific rules (CashRequiresAuthenticationRule/OnlineAllowedRule) — the engine
 * denies immediately on any !allowed result regardless of the terminal flag, so this
 * only matters for the allowed case.
 */
export class BlockedUserRule implements PaymentPolicyRule {
  readonly order = PaymentPolicyOrder.BLOCKED_USER;
  readonly terminal = false;

  applies(_context: PaymentPolicyContext): boolean {
    return true;
  }

  evaluate(context: PaymentPolicyContext): PaymentPolicyResult {
    if (context.isBlocked) {
      return {
        allowed: false,
        denialCode: "USER_BLOCKED",
        message: "This account has been blocked and cannot place orders",
      };
    }
    return { allowed: true };
  }
}
