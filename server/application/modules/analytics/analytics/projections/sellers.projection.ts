import type { SellerMetrics } from "@server/application/modules/analytics/analytics/models";

/** Seller analytics projection updated exclusively by capability events. */
export interface SellersProjection {
  readonly id: "sellers";
  readonly metrics: SellerMetrics;
  readonly lastEventName: string | null;
  readonly updatedAt: string;
}

export function createSellersProjection(metrics: SellerMetrics): SellersProjection {
  return Object.freeze({
    id: "sellers",
    metrics,
    lastEventName: null,
    updatedAt: metrics.updatedAt,
  });
}

export function withSellersProjectionEvent(
  projection: SellersProjection,
  metrics: SellerMetrics,
  eventName: string,
): SellersProjection {
  return Object.freeze({
    ...projection,
    metrics,
    lastEventName: eventName,
    updatedAt: metrics.updatedAt,
  });
}
