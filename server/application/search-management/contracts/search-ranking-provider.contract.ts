import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";

/** Result ranking — replace with Recommendation Engine / Experience Engine later. */
export interface ISearchRankingProvider {
  rank(
    products: readonly CatalogProductCard[],
    scores: ReadonlyMap<string, number>,
  ): readonly CatalogProductCard[];
}
