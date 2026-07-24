import type { IPaymentProvider, PaymentRequest, PaymentResponse } from "@server/infrastructure/payments";
import type { IFinikClientProvider } from "@server/infrastructure/finik/client";
import type { FinikConfiguration } from "@server/infrastructure/finik/configuration";
import { PaymentRequestMapper } from "@server/infrastructure/finik/mappers/payment-request.mapper";
import { PaymentResponseMapper } from "@server/infrastructure/finik/mappers/payment-response.mapper";
import type { FinikPaymentResource } from "@server/infrastructure/finik/shared";

/** Finik implementation of the infrastructure payment port. */
export class FinikPaymentProvider implements IPaymentProvider {
  private readonly requestMapper: PaymentRequestMapper;
  private readonly responseMapper = new PaymentResponseMapper();

  constructor(
    private readonly client: IFinikClientProvider,
    configuration: FinikConfiguration,
  ) {
    this.requestMapper = new PaymentRequestMapper(configuration);
    Object.freeze(this);
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const response = await this.client.request<FinikPaymentResource>({
      method: "POST",
      path: "/v1/payments",
      body: this.requestMapper.toCreatePaymentBody(request),
      idempotencyKey: request.idempotencyKey,
    });

    return this.responseMapper.toPaymentResponse(response.data, request.orderId);
  }

  async capturePayment(providerPaymentId: string, amount?: number): Promise<PaymentResponse> {
    const response = await this.client.request<FinikPaymentResource>({
      method: "POST",
      path: `/v1/payments/${encodeURIComponent(providerPaymentId)}/capture`,
      body: this.requestMapper.toCaptureBody(amount),
    });

    return this.responseMapper.toPaymentResponse(response.data);
  }

  async cancelPayment(providerPaymentId: string, reason?: string): Promise<PaymentResponse> {
    const response = await this.client.request<FinikPaymentResource>({
      method: "POST",
      path: `/v1/payments/${encodeURIComponent(providerPaymentId)}/cancel`,
      body: this.requestMapper.toCancelBody(reason),
    });

    return this.responseMapper.toPaymentResponse(response.data);
  }

  async refundPayment(
    providerPaymentId: string,
    amount?: number,
    reason?: string,
  ): Promise<PaymentResponse> {
    const response = await this.client.request<FinikPaymentResource>({
      method: "POST",
      path: `/v1/payments/${encodeURIComponent(providerPaymentId)}/refund`,
      body: this.requestMapper.toRefundBody(amount, reason),
    });

    return this.responseMapper.toPaymentResponse(response.data);
  }

  async getPaymentStatus(providerPaymentId: string): Promise<PaymentResponse | null> {
    const response = await this.client.request<FinikPaymentResource>({
      method: "GET",
      path: `/v1/payments/${encodeURIComponent(providerPaymentId)}`,
    });

    if (!response.data?.id) {
      return null;
    }

    return this.responseMapper.toPaymentResponse(response.data);
  }
}
