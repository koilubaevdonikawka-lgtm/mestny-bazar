/** Gateway request to initiate an external payment. */
export interface PaymentGatewayRequest {
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly method: string;
  readonly idempotencyKey: string;
  readonly description?: string;
  readonly customerPhone?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

/** Gateway response after initiating or querying a payment. */
export interface PaymentGatewayResponse {
  readonly providerPaymentId: string;
  readonly orderId: string;
  readonly status: string;
  readonly amount: number;
  readonly currency: string;
  readonly paymentUrl?: string | null;
}

/** External payment gateway contract — implemented by provider adapters. */
export interface IPaymentGateway {
  createPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse>;
  getPaymentStatus(providerPaymentId: string): Promise<PaymentGatewayResponse | null>;
}
