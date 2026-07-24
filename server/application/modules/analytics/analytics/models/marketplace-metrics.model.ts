/** Aggregated marketplace listing indicators. */
export interface MarketplaceMetrics {
  readonly totalListings: number;
  readonly publishedListings: number;
  readonly unpublishedListings: number;
  readonly updatedAt: string;
}

export function createEmptyMarketplaceMetrics(): MarketplaceMetrics {
  return Object.freeze({
    totalListings: 0,
    publishedListings: 0,
    unpublishedListings: 0,
    updatedAt: new Date().toISOString(),
  });
}

export function withListingSubmittedMetrics(metrics: MarketplaceMetrics): MarketplaceMetrics {
  return Object.freeze({
    ...metrics,
    totalListings: metrics.totalListings + 1,
    updatedAt: new Date().toISOString(),
  });
}

export function withListingPublishedMetrics(metrics: MarketplaceMetrics): MarketplaceMetrics {
  return Object.freeze({
    ...metrics,
    publishedListings: metrics.publishedListings + 1,
    updatedAt: new Date().toISOString(),
  });
}

export function withListingUnpublishedMetrics(metrics: MarketplaceMetrics): MarketplaceMetrics {
  return Object.freeze({
    ...metrics,
    unpublishedListings: metrics.unpublishedListings + 1,
    updatedAt: new Date().toISOString(),
  });
}
