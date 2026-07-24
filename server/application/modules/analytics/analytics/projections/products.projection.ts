import type { ProductMetrics } from "@server/application/modules/analytics/analytics/models";

/** Product analytics projection updated exclusively by capability events. */
export interface ProductsProjection {
  readonly id: "products";
  readonly metrics: ProductMetrics;
  readonly lastEventName: string | null;
  readonly updatedAt: string;
}

export function createProductsProjection(metrics: ProductMetrics): ProductsProjection {
  return Object.freeze({
    id: "products",
    metrics,
    lastEventName: null,
    updatedAt: metrics.updatedAt,
  });
}

export function withProductsProjectionEvent(
  projection: ProductsProjection,
  metrics: ProductMetrics,
  eventName: string,
): ProductsProjection {
  return Object.freeze({
    ...projection,
    metrics,
    lastEventName: eventName,
    updatedAt: metrics.updatedAt,
  });
}
