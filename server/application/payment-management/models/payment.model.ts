/** Payment lifecycle statuses. */
export const PaymentStatus = {
  Pending: "Pending",
  Processing: "Processing",
  Succeeded: "Succeeded",
  Failed: "Failed",
  Cancelled: "Cancelled",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/** Payment record owned by Payment Management. */
export interface Payment {
  readonly paymentId: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: PaymentStatus;
  readonly gatewayReference: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createPayment(input: {
  paymentId: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  gatewayReference?: string | null;
}): Payment {
  const now = new Date().toISOString();
  return Object.freeze({
    paymentId: input.paymentId,
    orderId: input.orderId.trim(),
    customerId: input.customerId.trim(),
    amount: input.amount,
    currency: input.currency,
    status: PaymentStatus.Pending,
    gatewayReference: input.gatewayReference ?? null,
    createdAt: now,
    updatedAt: now,
  });
}

export function withPaymentStatus(payment: Payment, status: PaymentStatus): Payment {
  return Object.freeze({
    ...payment,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function withGatewayReference(
  payment: Payment,
  gatewayReference: string,
): Payment {
  return Object.freeze({
    ...payment,
    gatewayReference,
    updatedAt: new Date().toISOString(),
  });
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return Object.values(PaymentStatus).includes(value as PaymentStatus);
}
