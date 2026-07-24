/** Raw delivery record for analytics aggregation. */
export interface DeliveryAnalyticsRecord {
  readonly deliveryId: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly status: string;
  readonly courierId: string | null;
  readonly createdAt: string;
}

export interface DeliveryAnalyticsSnapshot {
  readonly totalDeliveries: number;
  readonly deliveriesByStatus: Readonly<Record<string, number>>;
  readonly assignedCount: number;
  readonly records: readonly DeliveryAnalyticsRecord[];
}

/** Read-only delivery analytics access — no Delivery Repository access. */
export interface IDeliveryAnalyticsReader {
  getDeliverySnapshot(): Promise<DeliveryAnalyticsSnapshot>;
}
