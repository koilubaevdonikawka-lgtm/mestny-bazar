/** Aggregated seller activity indicators. */
export interface SellerMetrics {
  readonly totalSellers: number;
  readonly approvedSellers: number;
  readonly suspendedSellers: number;
  readonly updatedAt: string;
}

export function createEmptySellerMetrics(): SellerMetrics {
  return Object.freeze({
    totalSellers: 0,
    approvedSellers: 0,
    suspendedSellers: 0,
    updatedAt: new Date().toISOString(),
  });
}

export function withSellerRegisteredMetrics(metrics: SellerMetrics): SellerMetrics {
  return Object.freeze({
    ...metrics,
    totalSellers: metrics.totalSellers + 1,
    updatedAt: new Date().toISOString(),
  });
}

export function withSellerApprovedMetrics(metrics: SellerMetrics): SellerMetrics {
  return Object.freeze({
    ...metrics,
    approvedSellers: metrics.approvedSellers + 1,
    updatedAt: new Date().toISOString(),
  });
}

export function withSellerSuspendedMetrics(metrics: SellerMetrics): SellerMetrics {
  return Object.freeze({
    ...metrics,
    suspendedSellers: metrics.suspendedSellers + 1,
    updatedAt: new Date().toISOString(),
  });
}
