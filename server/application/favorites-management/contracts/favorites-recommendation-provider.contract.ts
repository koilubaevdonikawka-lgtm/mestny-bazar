/** Related products from favorites — replace with Recommendation Engine later. */
export interface IFavoritesRecommendationProvider {
  suggestFromFavorites(
    customerId: string,
    favoriteProductIds: readonly string[],
    limit?: number,
  ): Promise<readonly string[]>;
}
