import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResponse,
} from "@server/infrastructure/payments/payment-provider.port";

/** No-op payment provider for local development and tests. */
export class NoopPaymentProvider implements IPaymentProvider {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return Object.freeze({
      providerPaymentId: `noop-${request.orderId}`,
      orderId: request.orderId,
      status: "pending",
      amount: request.amount,
      currency: request.currency,
      paymentUrl: null,
    });
  }

  async capturePayment(providerPaymentId: string, amount?: number): Promise<PaymentResponse> {
    return Object.freeze({
      providerPaymentId,
      orderId: "",
      status: "captured",
      amount: amount ?? 0,
      currency: "KGS",
    });
  }

  async cancelPayment(providerPaymentId: string): Promise<PaymentResponse> {
    return Object.freeze({
      providerPaymentId,
      orderId: "",
      status: "cancelled",
      amount: 0,
      currency: "KGS",
    });
  }

  async refundPayment(providerPaymentId: string, amount?: number): Promise<PaymentResponse> {
    return Object.freeze({
      providerPaymentId,
      orderId: "",
      status: "refunded",
      amount: amount ?? 0,
      currency: "KGS",
    });
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentResponse | null> {
    return Object.freeze({
      providerPaymentId,
      orderId: "",
      status: "pending",
      amount: 0,
      currency: "KGS",
    });
  }
}
