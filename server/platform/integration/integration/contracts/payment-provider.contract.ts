/** Provider-agnostic payment lifecycle status. */
export type PaymentProviderStatus =
  | "pending"
  | "awaiting"
  | "authorized"
  | "captured"
  | "paid"
  | "cancelled"
  | "failed"
  | "refunded";

export interface PaymentRequest {
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly idempotencyKey: string;
  readonly description?: string;
  readonly customerEmail?: string;
  readonly customerPhone?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface PaymentResponse {
  readonly providerPaymentId: string;
  readonly orderId: string;
  readonly status: PaymentProviderStatus;
  readonly amount: number;
  readonly currency: string;
  readonly paymentUrl?: string | null;
  readonly capturedAt?: string;
  readonly raw?: Readonly<Record<string, unknown>>;
}

/** Platform payment provider contract. */
export interface IPaymentProvider {
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  capturePayment(providerPaymentId: string, amount?: number): Promise<PaymentResponse>;
  cancelPayment(providerPaymentId: string, reason?: string): Promise<PaymentResponse>;
  refundPayment(
    providerPaymentId: string,
    amount?: number,
    reason?: string,
  ): Promise<PaymentResponse>;
  getPaymentStatus(providerPaymentId: string): Promise<PaymentResponse | null>;
}
