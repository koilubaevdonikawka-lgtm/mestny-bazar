/** Raw order record for analytics aggregation. */
export interface OrderAnalyticsRecord {
  readonly orderId: string;
  readonly customerId: string;
  readonly status: string;
  readonly subtotal: number;
  readonly currency: string;
  readonly lineCount: number;
  readonly sellerIds: readonly string[];
  readonly createdAt: string;
}

export interface OrderAnalyticsSnapshot {
  readonly totalOrders: number;
  readonly totalRevenue: number;
  readonly currency: string | null;
  readonly ordersByStatus: Readonly<Record<string, number>>;
  readonly records: readonly OrderAnalyticsRecord[];
}

/** Read-only order analytics access — no Order Repository access. */
export interface IOrderAnalyticsReader {
  getOrderSnapshot(): Promise<OrderAnalyticsSnapshot>;
}
