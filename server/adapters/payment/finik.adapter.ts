import type { CreatePaymentRequest, PaymentIntentDTO } from "@shared/contracts/payment";
import type { IPaymentProvider, PaymentWebhookPayload } from "@server/ports/payment.provider";

/** Finik payment adapter — implemented in Stage 7. */
export class FinikPaymentAdapter implements IPaymentProvider {
  async createPayment(_request: CreatePaymentRequest): Promise<PaymentIntentDTO> {
    throw new Error("FinikPaymentAdapter.createPayment not implemented (Stage 7)");
  }

  async verifyWebhook(_payload: PaymentWebhookPayload): Promise<boolean> {
    throw new Error("FinikPaymentAdapter.verifyWebhook not implemented (Stage 7)");
  }

  async getStatus(_providerPaymentId: string): Promise<PaymentIntentDTO | null> {
    throw new Error("FinikPaymentAdapter.getStatus not implemented (Stage 7)");
  }
}
