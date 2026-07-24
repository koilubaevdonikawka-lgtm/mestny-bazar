import type { SalesMetrics } from "@server/application/modules/analytics/analytics/models";

/** Sales analytics projection updated exclusively by capability events. */
export interface SalesProjection {
  readonly id: "sales";
  readonly metrics: SalesMetrics;
  readonly lastEventName: string | null;
  readonly updatedAt: string;
}

export function createSalesProjection(metrics: SalesMetrics): SalesProjection {
  return Object.freeze({
    id: "sales",
    metrics,
    lastEventName: null,
    updatedAt: metrics.updatedAt,
  });
}

export function withSalesProjectionEvent(
  projection: SalesProjection,
  metrics: SalesMetrics,
  eventName: string,
): SalesProjection {
  return Object.freeze({
    ...projection,
    metrics,
    lastEventName: eventName,
    updatedAt: metrics.updatedAt,
  });
}
