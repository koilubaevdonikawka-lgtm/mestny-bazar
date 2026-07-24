export type PaymentProviderStatus = "pending" | "awaiting" | "paid" | "failed" | "refunded";

export interface PaymentIntentDTO {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentProviderStatus;
  paymentUrl: string | null;
  providerPaymentId: string | null;
  createdAt: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  idempotencyKey: string;
}
