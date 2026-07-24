import type { IFavoritesRecommendationProvider } from "@server/application/favorites-management/contracts/favorites-recommendation-provider.contract";

const DEFAULT_LIMIT = 10;

/** Simple recommendation stub until Recommendation Engine is connected. */
export class DefaultFavoritesRecommendationProvider implements IFavoritesRecommendationProvider {
  async suggestFromFavorites(
    _customerId: string,
    favoriteProductIds: readonly string[],
    limit = DEFAULT_LIMIT,
  ): Promise<readonly string[]> {
    return Object.freeze(favoriteProductIds.slice(0, limit));
  }
}
