import type { PaymentStatusValue } from "@server/application/modules/payment/payment/models";

/** Raised when a payment record is created by the Payment capability module. */
export interface PaymentCreatedEvent {
  readonly type: "PaymentCreated";
  readonly paymentId: string;
  readonly orderId: string;
  readonly providerPaymentId: string;
  readonly status: PaymentStatusValue;
  readonly amount: number;
  readonly currency: string;
  readonly occurredAt: string;
}

export function createPaymentCreatedEvent(input: {
  paymentId: string;
  orderId: string;
  providerPaymentId: string;
  status: PaymentStatusValue;
  amount: number;
  currency: string;
}): PaymentCreatedEvent {
  return Object.freeze({
    type: "PaymentCreated",
    paymentId: input.paymentId,
    orderId: input.orderId,
    providerPaymentId: input.providerPaymentId,
    status: input.status,
    amount: input.amount,
    currency: input.currency,
    occurredAt: new Date().toISOString(),
  });
}
