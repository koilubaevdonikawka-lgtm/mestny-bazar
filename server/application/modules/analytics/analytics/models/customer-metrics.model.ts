/** Aggregated customer activity indicators. */
export interface CustomerMetrics {
  readonly totalCustomers: number;
  readonly activeCustomers: number;
  readonly updatedAt: string;
}

export function createEmptyCustomerMetrics(): CustomerMetrics {
  return Object.freeze({
    totalCustomers: 0,
    activeCustomers: 0,
    updatedAt: new Date().toISOString(),
  });
}

export function withCustomerRegisteredMetrics(metrics: CustomerMetrics): CustomerMetrics {
  return Object.freeze({
    totalCustomers: metrics.totalCustomers + 1,
    activeCustomers: metrics.activeCustomers + 1,
    updatedAt: new Date().toISOString(),
  });
}
