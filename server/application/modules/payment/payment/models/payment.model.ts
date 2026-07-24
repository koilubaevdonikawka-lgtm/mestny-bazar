import { normalizePaymentMethod } from "@server/application/modules/payment/payment/models/payment-method.model";
import {
  PaymentStatus,
  type PaymentStatus as PaymentStatusValue,
} from "@server/application/modules/payment/payment/models/payment-status.model";

/** Payment aggregate snapshot owned by the Payment capability module. */
export interface Payment {
  readonly id: string;
  readonly orderId: string;
  readonly providerPaymentId: string;
  readonly method: string;
  readonly status: PaymentStatusValue;
  readonly amount: number;
  readonly currency: string;
  readonly paymentUrl: string | null;
  readonly idempotencyKey: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createPayment(input: {
  id: string;
  orderId: string;
  providerPaymentId: string;
  method: string;
  status: PaymentStatusValue;
  amount: number;
  currency: string;
  paymentUrl?: string | null;
  idempotencyKey: string;
}): Payment {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    orderId: input.orderId.trim(),
    providerPaymentId: input.providerPaymentId.trim(),
    method: normalizePaymentMethod(input.method),
    status: input.status,
    amount: Number(input.amount.toFixed(2)),
    currency: input.currency.trim(),
    paymentUrl: input.paymentUrl ?? null,
    idempotencyKey: input.idempotencyKey.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withPaymentStatus(payment: Payment, status: PaymentStatusValue): Payment {
  return Object.freeze({
    ...payment,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function mapGatewayStatusToPaymentStatus(status: string): PaymentStatusValue {
  switch (status.trim().toLowerCase()) {
    case "paid":
    case "succeeded":
      return PaymentStatus.Succeeded;
    case "captured":
      return PaymentStatus.Captured;
    case "authorized":
      return PaymentStatus.Authorized;
    case "awaiting":
      return PaymentStatus.Awaiting;
    case "failed":
      return PaymentStatus.Failed;
    case "cancelled":
    case "canceled":
      return PaymentStatus.Cancelled;
    case "refunded":
      return PaymentStatus.Refunded;
    default:
      return PaymentStatus.Pending;
  }
}
