import type { CreatePaymentRequest, PaymentIntentDTO } from "@shared/contracts/payment";

export interface PaymentWebhookPayload {
  providerPaymentId: string;
  orderId: string;
  status: "paid" | "failed";
  rawBody: string;
  signature: string | null;
}

export interface IPaymentProvider {
  createPayment(request: CreatePaymentRequest): Promise<PaymentIntentDTO>;
  verifyWebhook(payload: PaymentWebhookPayload): Promise<boolean>;
  getStatus(providerPaymentId: string): Promise<PaymentIntentDTO | null>;
}
