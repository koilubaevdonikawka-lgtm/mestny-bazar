import type { Product } from "@server/application/modules/product/product/models";

/**
 * Popularity ranking port — replace with Analytics BCM / Experience Engine later.
 * Default implementation uses simple heuristics only.
 */
export interface ICatalogPopularityProvider {
  rankPopular(products: readonly Product[], limit?: number): readonly Product[];
}
