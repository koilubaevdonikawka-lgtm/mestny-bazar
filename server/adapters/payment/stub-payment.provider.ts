import type { CreatePaymentRequest, PaymentIntentDTO } from "@shared/contracts/payment";
import type { IPaymentProvider, PaymentWebhookPayload } from "@server/ports/payment.provider";
import { logger } from "@shared/observability/logger";

/**
 * Safe, non-throwing fallback used when Finik credentials are not configured
 * (Промпт №075: "если API-ключей нет — не останавливать разработку... до
 * этого момента использовать только безопасные заглушки"). Checkout must
 * stay fully functional for cash payments; online payment simply reports
 * itself unavailable instead of crashing — CheckoutPaymentHandler surfaces
 * this as a failed payment status, never an unhandled exception.
 */
export class StubPaymentProvider implements IPaymentProvider {
  async createPayment(request: CreatePaymentRequest): Promise<PaymentIntentDTO> {
    logger.warn("payment:provider-not-configured", { orderId: request.orderId });
    return {
      id: `stub_${request.idempotencyKey}`,
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      status: "failed",
      paymentUrl: null,
      providerPaymentId: null,
      createdAt: new Date().toISOString(),
    };
  }

  async verifyWebhook(_payload: PaymentWebhookPayload): Promise<boolean> {
    return false;
  }

  async getStatus(_providerPaymentId: string): Promise<PaymentIntentDTO | null> {
    return null;
  }
}
