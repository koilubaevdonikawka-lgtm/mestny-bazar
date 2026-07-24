import type { MarketplaceMetrics } from "@server/application/modules/analytics/analytics/models";

/** Marketplace analytics projection updated exclusively by capability events. */
export interface MarketplaceProjection {
  readonly id: "marketplace";
  readonly metrics: MarketplaceMetrics;
  readonly lastEventName: string | null;
  readonly updatedAt: string;
}

export function createMarketplaceProjection(
  metrics: MarketplaceMetrics,
): MarketplaceProjection {
  return Object.freeze({
    id: "marketplace",
    metrics,
    lastEventName: null,
    updatedAt: metrics.updatedAt,
  });
}

export function withMarketplaceProjectionEvent(
  projection: MarketplaceProjection,
  metrics: MarketplaceMetrics,
  eventName: string,
): MarketplaceProjection {
  return Object.freeze({
    ...projection,
    metrics,
    lastEventName: eventName,
    updatedAt: metrics.updatedAt,
  });
}
