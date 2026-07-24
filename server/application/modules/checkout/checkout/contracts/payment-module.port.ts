export interface PaymentReference {
  readonly paymentId: string;
  readonly status: string;
  readonly amount: number;
  readonly currency: string;
}

export interface CreatePaymentInput {
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly method: string;
}

/** Payment module contract for checkout orchestration. */
export interface IPaymentModule {
  createPayment(input: CreatePaymentInput): Promise<PaymentReference>;
}
