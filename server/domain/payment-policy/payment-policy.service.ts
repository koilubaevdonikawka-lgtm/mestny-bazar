import type { PaymentMethod, PaymentStatus } from "@shared/contracts/order";
import type {
  IPaymentPolicy,
  PaymentPolicyContext,
  PaymentPolicyResult,
} from "@server/ports/payment-policy.port";
import type { PaymentPolicyRule } from "@server/domain/payment-policy/payment-policy.rule";
import {
  CashPaymentRequiresAuthentication,
  PaymentPolicyDeniedError,
} from "@server/domain/payment-policy.errors";

const INITIAL_PAYMENT_STATUS: Record<PaymentMethod, PaymentStatus> = {
  ONLINE: "awaiting",
  CASH: "unpaid",
};

function sortRulesByOrder(rules: PaymentPolicyRule[]): PaymentPolicyRule[] {
  return [...rules].sort((a, b) => a.order - b.order);
}

/**
 * Evaluates payment method eligibility via an ordered rule chain.
 * Rule order is determined at composition time (DI Container), not hardcoded here.
 */
export class PaymentPolicyService implements IPaymentPolicy {
  private readonly rules: PaymentPolicyRule[];

  constructor(rules: PaymentPolicyRule[]) {
    this.rules = sortRulesByOrder(rules);
  }

  canUsePaymentMethod(context: PaymentPolicyContext): PaymentPolicyResult {
    for (const rule of this.rules) {
      if (!rule.applies(context)) continue;

      const result = rule.evaluate(context);
      if (!result.allowed) return result;

      const isTerminal = rule.terminal !== false;
      if (isTerminal) return result;
    }

    return {
      allowed: false,
      denialCode: "UNKNOWN_PAYMENT_METHOD",
      message: `Unknown payment method: ${context.paymentMethod}`,
    };
  }

  assertCanUsePaymentMethod(context: PaymentPolicyContext): void {
    const result = this.canUsePaymentMethod(context);
    if (result.allowed) return;

    if (result.denialCode === "CASH_REQUIRES_AUTHENTICATION") {
      throw new CashPaymentRequiresAuthentication(result.message);
    }

    throw new PaymentPolicyDeniedError(
      result.denialCode ?? "PAYMENT_POLICY_DENIED",
      result.message ?? "Payment method is not allowed",
    );
  }

  getInitialPaymentStatus(paymentMethod: PaymentMethod): PaymentStatus {
    return INITIAL_PAYMENT_STATUS[paymentMethod];
  }
}
