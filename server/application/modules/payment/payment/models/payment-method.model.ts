/** Supported payment methods within the Payment capability module. */
export const PaymentMethod = {
  Card: "card",
  Cash: "cash",
  Finik: "finik",
  BankTransfer: "bank_transfer",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PAYMENT_METHOD_VALUES: readonly PaymentMethod[] = Object.values(PaymentMethod);

export function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHOD_VALUES.includes(value as PaymentMethod);
}

export function normalizePaymentMethod(value: string): string {
  return value.trim().toLowerCase();
}
