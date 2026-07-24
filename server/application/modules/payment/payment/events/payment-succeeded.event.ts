import type { PaymentStatusValue } from "@server/application/modules/payment/payment/models";

/** Raised when a payment reaches a successful terminal state. */
export interface PaymentSucceededEvent {
  readonly type: "PaymentSucceeded";
  readonly paymentId: string;
  readonly orderId: string;
  readonly providerPaymentId: string;
  readonly status: PaymentStatusValue;
  readonly amount: number;
  readonly currency: string;
  readonly occurredAt: string;
}

export function createPaymentSucceededEvent(input: {
  paymentId: string;
  orderId: string;
  providerPaymentId: string;
  status: PaymentStatusValue;
  amount: number;
  currency: string;
}): PaymentSucceededEvent {
  return Object.freeze({
    type: "PaymentSucceeded",
    paymentId: input.paymentId,
    orderId: input.orderId,
    providerPaymentId: input.providerPaymentId,
    status: input.status,
    amount: input.amount,
    currency: input.currency,
    occurredAt: new Date().toISOString(),
  });
}
