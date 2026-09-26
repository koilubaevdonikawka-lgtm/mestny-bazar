import type { PaymentPolicyContext, PaymentPolicyResult } from "@server/ports/payment-policy.port";
import type { PaymentPolicyRule } from "@server/domain/payment-policy/payment-policy.rule";
import { PaymentPolicyOrder } from "@server/domain/payment-policy/payment-policy-order";

/**
 * CASH is available to all users, including guests (Задача №314 — replaces
 * CashRequiresAuthenticationRule; the owner accepted the fake-cash-order
 * risk). Every payment method needs a rule that applies to it:
 * PaymentPolicyService denies with UNKNOWN_PAYMENT_METHOD when none does.
 */
export class CashAllowedRule implements PaymentPolicyRule {
  readonly order = PaymentPolicyOrder.CASH;

  applies(context: PaymentPolicyContext): boolean {
    return context.paymentMethod === "CASH";
  }

  evaluate(_context: PaymentPolicyContext): PaymentPolicyResult {
    return { allowed: true };
  }
}
