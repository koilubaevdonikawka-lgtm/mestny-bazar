export interface CreatePaymentDto {
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly method: string;
  readonly idempotencyKey?: string;
  readonly description?: string;
  readonly customerPhone?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}
