import type { PaymentPolicyContext, PaymentPolicyResult } from "@server/ports/payment-policy.port";
import type { PaymentPolicyRule } from "@server/domain/payment-policy/payment-policy.rule";
import { PaymentPolicyOrder } from "@server/domain/payment-policy/payment-policy-order";

/** ONLINE is available to all users, including guests. */
export class OnlineAllowedRule implements PaymentPolicyRule {
  readonly order = PaymentPolicyOrder.ONLINE;

  applies(context: PaymentPolicyContext): boolean {
    return context.paymentMethod === "ONLINE";
  }

  evaluate(_context: PaymentPolicyContext): PaymentPolicyResult {
    return { allowed: true };
  }
}
