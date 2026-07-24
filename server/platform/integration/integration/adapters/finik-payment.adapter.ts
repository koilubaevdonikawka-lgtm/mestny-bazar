import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResponse,
} from "@server/platform/integration/integration/contracts";
import type { IPaymentProvider as InfrastructurePaymentProvider } from "@server/infrastructure/payments";

/** Adapts infrastructure payment implementations to the platform payment contract. */
export class FinikPaymentAdapter implements IPaymentProvider {
  constructor(private readonly delegate: InfrastructurePaymentProvider) {}

  createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return this.delegate.createPayment(request);
  }

  capturePayment(providerPaymentId: string, amount?: number): Promise<PaymentResponse> {
    return this.delegate.capturePayment(providerPaymentId, amount);
  }

  cancelPayment(providerPaymentId: string, reason?: string): Promise<PaymentResponse> {
    return this.delegate.cancelPayment(providerPaymentId, reason);
  }

  refundPayment(
    providerPaymentId: string,
    amount?: number,
    reason?: string,
  ): Promise<PaymentResponse> {
    return this.delegate.refundPayment(providerPaymentId, amount, reason);
  }

  getPaymentStatus(providerPaymentId: string): Promise<PaymentResponse | null> {
    return this.delegate.getPaymentStatus(providerPaymentId);
  }
}
