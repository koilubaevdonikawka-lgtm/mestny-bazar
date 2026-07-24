/** Aggregated sales indicators derived from order and payment events. */
export interface SalesMetrics {
  readonly totalRevenue: number;
  readonly totalOrders: number;
  readonly averageOrderValue: number;
  readonly currency: string;
  readonly updatedAt: string;
}

export function createEmptySalesMetrics(currency = "KGS"): SalesMetrics {
  const timestamp = new Date().toISOString();
  return Object.freeze({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    currency,
    updatedAt: timestamp,
  });
}

export function withSalesMetricsUpdate(
  metrics: SalesMetrics,
  input: { orderTotal: number; currency: string },
): SalesMetrics {
  const totalOrders = metrics.totalOrders + 1;
  const totalRevenue = metrics.totalRevenue + input.orderTotal;
  return Object.freeze({
    totalRevenue,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    currency: input.currency || metrics.currency,
    updatedAt: new Date().toISOString(),
  });
}
