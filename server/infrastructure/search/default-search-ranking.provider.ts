import type { CatalogProductCard } from "@server/application/catalog-management/models/catalog-product.model";
import type { ISearchRankingProvider } from "@server/application/search-management/contracts/search-ranking-provider.contract";

/** Default relevance ranking by full-text score, then name. */
export class DefaultSearchRankingProvider implements ISearchRankingProvider {
  rank(
    products: readonly CatalogProductCard[],
    scores: ReadonlyMap<string, number>,
  ): readonly CatalogProductCard[] {
    return [...products].sort((left, right) => {
      const scoreDiff = (scores.get(right.id) ?? 0) - (scores.get(left.id) ?? 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return left.name.localeCompare(right.name);
    });
  }
}
