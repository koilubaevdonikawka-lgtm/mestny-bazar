/** Raw payment record for analytics aggregation. */
export interface PaymentAnalyticsRecord {
  readonly paymentId: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly createdAt: string;
}

export interface PaymentAnalyticsSnapshot {
  readonly totalPayments: number;
  readonly totalAmount: number;
  readonly succeededAmount: number;
  readonly currency: string | null;
  readonly paymentsByStatus: Readonly<Record<string, number>>;
  readonly records: readonly PaymentAnalyticsRecord[];
}

/** Read-only payment analytics access — no Payment Repository access. */
export interface IPaymentAnalyticsReader {
  getPaymentSnapshot(): Promise<PaymentAnalyticsSnapshot>;
}
