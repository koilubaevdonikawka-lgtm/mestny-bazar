import type { PaymentStatusValue } from "@server/application/modules/payment/payment/models";

/** Raised when a payment fails or is cancelled. */
export interface PaymentFailedEvent {
  readonly type: "PaymentFailed";
  readonly paymentId: string;
  readonly orderId: string;
  readonly providerPaymentId: string;
  readonly status: PaymentStatusValue;
  readonly amount: number;
  readonly currency: string;
  readonly occurredAt: string;
}

export function createPaymentFailedEvent(input: {
  paymentId: string;
  orderId: string;
  providerPaymentId: string;
  status: PaymentStatusValue;
  amount: number;
  currency: string;
}): PaymentFailedEvent {
  return Object.freeze({
    type: "PaymentFailed",
    paymentId: input.paymentId,
    orderId: input.orderId,
    providerPaymentId: input.providerPaymentId,
    status: input.status,
    amount: input.amount,
    currency: input.currency,
    occurredAt: new Date().toISOString(),
  });
}
