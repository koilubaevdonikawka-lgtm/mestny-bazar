/** Aggregated product catalog indicators. */
export interface ProductMetrics {
  readonly totalProducts: number;
  readonly readyForPublicationProducts: number;
  readonly updatedAt: string;
}

export function createEmptyProductMetrics(): ProductMetrics {
  return Object.freeze({
    totalProducts: 0,
    readyForPublicationProducts: 0,
    updatedAt: new Date().toISOString(),
  });
}

export function withProductCreatedMetrics(metrics: ProductMetrics): ProductMetrics {
  return Object.freeze({
    ...metrics,
    totalProducts: metrics.totalProducts + 1,
    updatedAt: new Date().toISOString(),
  });
}

export function withProductReadyMetrics(metrics: ProductMetrics): ProductMetrics {
  return Object.freeze({
    ...metrics,
    readyForPublicationProducts: metrics.readyForPublicationProducts + 1,
    updatedAt: new Date().toISOString(),
  });
}
