import type { PaymentPolicyContext, PaymentPolicyResult } from "@server/ports/payment-policy.port";
import type { PaymentPolicyRule } from "@server/domain/payment-policy/payment-policy.rule";
import { PaymentPolicyOrder } from "@server/domain/payment-policy/payment-policy-order";

/** CASH requires an authenticated user. */
export class CashRequiresAuthenticationRule implements PaymentPolicyRule {
  readonly order = PaymentPolicyOrder.CASH_AUTH;

  applies(context: PaymentPolicyContext): boolean {
    return context.paymentMethod === "CASH";
  }

  evaluate(context: PaymentPolicyContext): PaymentPolicyResult {
    if (!context.user.id) {
      return {
        allowed: false,
        denialCode: "CASH_REQUIRES_AUTHENTICATION",
        message: "Cash payment requires authentication",
      };
    }
    return { allowed: true };
  }
}
