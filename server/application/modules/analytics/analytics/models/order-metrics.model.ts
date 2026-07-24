/** Aggregated order lifecycle indicators. */
export interface OrderMetrics {
  readonly totalOrders: number;
  readonly completedOrders: number;
  readonly cancelledOrders: number;
  readonly totalItems: number;
  readonly updatedAt: string;
}

export function createEmptyOrderMetrics(): OrderMetrics {
  return Object.freeze({
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalItems: 0,
    updatedAt: new Date().toISOString(),
  });
}

export function withOrderCreatedMetrics(
  metrics: OrderMetrics,
  itemCount: number,
): OrderMetrics {
  return Object.freeze({
    ...metrics,
    totalOrders: metrics.totalOrders + 1,
    totalItems: metrics.totalItems + itemCount,
    updatedAt: new Date().toISOString(),
  });
}

export function withOrderStatusMetrics(
  metrics: OrderMetrics,
  status: string,
): OrderMetrics {
  if (status === "completed" || status === "delivered") {
    return Object.freeze({
      ...metrics,
      completedOrders: metrics.completedOrders + 1,
      updatedAt: new Date().toISOString(),
    });
  }
  if (status === "cancelled") {
    return Object.freeze({
      ...metrics,
      cancelledOrders: metrics.cancelledOrders + 1,
      updatedAt: new Date().toISOString(),
    });
  }
  return metrics;
}
