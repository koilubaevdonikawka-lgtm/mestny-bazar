export interface PaymentGatewayRequest {
  readonly paymentId: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly amount: number;
  readonly currency: string;
}

export interface PaymentGatewayResult {
  readonly gatewayReference: string;
  readonly status: "pending" | "processing" | "succeeded" | "failed" | "cancelled";
  readonly message?: string;
}

/**
 * Payment gateway port — all providers (Mock, Finik, Stripe, PayPal) implement this interface.
 * Application Layer depends only on this contract, not on provider internals.
 */
export interface IPaymentGateway {
  initiate(request: PaymentGatewayRequest): Promise<PaymentGatewayResult>;
  confirm(gatewayReference: string): Promise<PaymentGatewayResult>;
  fail(gatewayReference: string, reason?: string): Promise<PaymentGatewayResult>;
  cancel(gatewayReference: string): Promise<PaymentGatewayResult>;
}
