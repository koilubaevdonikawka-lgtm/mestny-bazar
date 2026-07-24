import type {
  IPaymentGateway,
  PaymentGatewayRequest,
  PaymentGatewayResponse,
} from "@server/application/modules/payment/payment/contracts";
import type { IPaymentProvider } from "@server/infrastructure/payments";

/** Adapts the infrastructure payment provider to the Payment module gateway contract. */
export class ProviderPaymentGateway implements IPaymentGateway {
  constructor(private readonly provider: IPaymentProvider) {}

  async createPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    const response = await this.provider.createPayment({
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      idempotencyKey: request.idempotencyKey,
      description: request.description,
      customerPhone: request.customerPhone,
      metadata: request.metadata,
    });

    return Object.freeze({
      providerPaymentId: response.providerPaymentId,
      orderId: response.orderId,
      status: response.status,
      amount: response.amount,
      currency: response.currency,
      paymentUrl: response.paymentUrl ?? null,
    });
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentGatewayResponse | null> {
    const response = await this.provider.getPaymentStatus(providerPaymentId);
    if (!response) {
      return null;
    }

    return Object.freeze({
      providerPaymentId: response.providerPaymentId,
      orderId: response.orderId,
      status: response.status,
      amount: response.amount,
      currency: response.currency,
      paymentUrl: response.paymentUrl ?? null,
    });
  }
}
