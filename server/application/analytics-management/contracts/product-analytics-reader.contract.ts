/** Raw product record for analytics aggregation. */
export interface ProductAnalyticsRecord {
  readonly productId: string;
  readonly sellerId: string;
  readonly productName: string;
  readonly price: number;
  readonly currency: string;
  readonly categoryId: string | null;
  readonly available: boolean;
}

export interface ProductAnalyticsSnapshot {
  readonly totalProducts: number;
  readonly availableProducts: number;
  readonly productsBySeller: Readonly<Record<string, number>>;
  readonly records: readonly ProductAnalyticsRecord[];
}

/** Read-only product analytics access — no Product BCM access. */
export interface IProductAnalyticsReader {
  getProductSnapshot(): Promise<ProductAnalyticsSnapshot>;
}
