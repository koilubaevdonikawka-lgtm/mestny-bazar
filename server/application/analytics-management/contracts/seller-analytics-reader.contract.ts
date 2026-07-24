/** Raw seller record for analytics aggregation. */
export interface SellerAnalyticsRecord {
  readonly sellerId: string;
  readonly productCount: number;
  readonly orderCount: number;
  readonly revenue: number;
  readonly currency: string | null;
}

export interface SellerAnalyticsSnapshot {
  readonly totalSellers: number;
  readonly topSellersByRevenue: readonly SellerAnalyticsRecord[];
  readonly records: readonly SellerAnalyticsRecord[];
}

/** Read-only seller analytics access. */
export interface ISellerAnalyticsReader {
  getSellerSnapshot(): Promise<SellerAnalyticsSnapshot>;
}
