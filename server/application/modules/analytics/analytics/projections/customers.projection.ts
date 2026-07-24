import type { CustomerMetrics } from "@server/application/modules/analytics/analytics/models";

/** Customer analytics projection updated exclusively by capability events. */
export interface CustomersProjection {
  readonly id: "customers";
  readonly metrics: CustomerMetrics;
  readonly lastEventName: string | null;
  readonly updatedAt: string;
}

export function createCustomersProjection(metrics: CustomerMetrics): CustomersProjection {
  return Object.freeze({
    id: "customers",
    metrics,
    lastEventName: null,
    updatedAt: metrics.updatedAt,
  });
}

export function withCustomersProjectionEvent(
  projection: CustomersProjection,
  metrics: CustomerMetrics,
  eventName: string,
): CustomersProjection {
  return Object.freeze({
    ...projection,
    metrics,
    lastEventName: eventName,
    updatedAt: metrics.updatedAt,
  });
}
