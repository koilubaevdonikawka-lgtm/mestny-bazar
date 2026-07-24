import type { ICatalogRecommendationProvider } from "@server/application/catalog-management/contracts/catalog-recommendation-provider.contract";
import type { CatalogRecommendationContext } from "@server/application/catalog-management/dto/catalog-query.dto";
import type { Product } from "@server/application/modules/product/product/models";

const DEFAULT_LIMIT = 20;

/** Simple heuristic recommendation until Recommendation Engine / AI Personalization is connected. */
export class DefaultCatalogRecommendationProvider implements ICatalogRecommendationProvider {
  recommend(
    candidates: readonly Product[],
    _context: CatalogRecommendationContext = {},
    limit = DEFAULT_LIMIT,
  ): readonly Product[] {
    return [...candidates]
      .sort((left, right) => left.name.localeCompare(right.name))
      .slice(0, limit);
  }

  related(source: Product, candidates: readonly Product[], limit = DEFAULT_LIMIT): readonly Product[] {
    const categoryId = source.attributes.categoryId;
    const related = candidates.filter((product) => {
      if (product.id === source.id) {
        return false;
      }
      if (categoryId) {
        return product.attributes.categoryId === categoryId;
      }
      return product.sellerId === source.sellerId;
    });

    if (related.length >= limit) {
      return related.slice(0, limit);
    }

    const fallback = candidates.filter(
      (product) => product.id !== source.id && !related.some((item) => item.id === product.id),
    );
    return [...related, ...fallback].slice(0, limit);
  }
}
