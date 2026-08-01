/**
 * analytics.md — a purely consuming module, no own tables. Realizable now from
 * order/product data already accumulated in Stages 2-3; top-funnel metrics
 * (views, cart abandonment) need new tracking infra and are explicitly out of
 * scope for this stage.
 */
export interface SalesAnalyticsParams {
  /** ISO date (inclusive). Defaults to 30 days before periodEnd. */
  periodStart?: string;
  /** ISO date (inclusive). Defaults to now. */
  periodEnd?: string;
}

export interface TopProductEntry {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface SalesAnalyticsDTO {
  periodStart: string;
  periodEnd: string;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
  topProducts: TopProductEntry[];
}
