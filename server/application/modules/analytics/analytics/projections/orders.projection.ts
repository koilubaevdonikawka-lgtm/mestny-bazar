import type { OrderMetrics } from "@server/application/modules/analytics/analytics/models";

/** Order analytics projection updated exclusively by capability events. */
export interface OrdersProjection {
  readonly id: "orders";
  readonly metrics: OrderMetrics;
  readonly lastEventName: string | null;
  readonly updatedAt: string;
}

export function createOrdersProjection(metrics: OrderMetrics): OrdersProjection {
  return Object.freeze({
    id: "orders",
    metrics,
    lastEventName: null,
    updatedAt: metrics.updatedAt,
  });
}

export function withOrdersProjectionEvent(
  projection: OrdersProjection,
  metrics: OrderMetrics,
  eventName: string,
): OrdersProjection {
  return Object.freeze({
    ...projection,
    metrics,
    lastEventName: eventName,
    updatedAt: metrics.updatedAt,
  });
}
