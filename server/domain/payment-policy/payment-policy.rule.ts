import type { PaymentPolicyContext, PaymentPolicyResult } from "@server/ports/payment-policy.port";

export interface PaymentPolicyRule {
  /** Lower values run first. Order is defined per rule, composed in DI Container. */
  readonly order: number;
  /**
   * When false, an allowed result continues the chain (for global guard rules).
   * Defaults to true — method-specific rules stop after allowing.
   */
  readonly terminal?: boolean;
  applies(context: PaymentPolicyContext): boolean;
  evaluate(context: PaymentPolicyContext): PaymentPolicyResult;
}
