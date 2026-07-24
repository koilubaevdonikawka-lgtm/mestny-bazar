import type { Product } from "@server/application/modules/product/product/models";
import type { CatalogRecommendationContext } from "@server/application/catalog-management/dto/catalog-query.dto";

/**
 * Recommendation port — replace with Recommendation Engine / AI Personalization later.
 * Default implementation uses simple heuristics only.
 */
export interface ICatalogRecommendationProvider {
  recommend(
    candidates: readonly Product[],
    context?: CatalogRecommendationContext,
    limit?: number,
  ): readonly Product[];

  related(
    product: Product,
    candidates: readonly Product[],
    limit?: number,
  ): readonly Product[];
}
