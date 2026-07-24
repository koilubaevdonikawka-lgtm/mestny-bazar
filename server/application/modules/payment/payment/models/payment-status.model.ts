/** Canonical payment lifecycle statuses for the Payment capability module. */
export const PaymentStatus = {
  Pending: "Pending",
  Awaiting: "Awaiting",
  Authorized: "Authorized",
  Captured: "Captured",
  Succeeded: "Succeeded",
  Failed: "Failed",
  Cancelled: "Cancelled",
  Refunded: "Refunded",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PAYMENT_STATUS_VALUES: readonly PaymentStatus[] = Object.values(PaymentStatus);

export function isPaymentStatus(value: string): value is PaymentStatus {
  return PAYMENT_STATUS_VALUES.includes(value as PaymentStatus);
}

export function assertPaymentStatus(value: string): PaymentStatus {
  if (!isPaymentStatus(value)) {
    throw new Error(`Unknown payment status: ${value}`);
  }
  return value;
}

export function isSuccessfulPaymentStatus(status: PaymentStatus): boolean {
  return (
    status === PaymentStatus.Succeeded ||
    status === PaymentStatus.Captured ||
    status === PaymentStatus.Authorized
  );
}

export function isFailedPaymentStatus(status: PaymentStatus): boolean {
  return status === PaymentStatus.Failed || status === PaymentStatus.Cancelled;
}
