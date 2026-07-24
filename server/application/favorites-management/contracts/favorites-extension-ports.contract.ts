/**
 * Future integration ports for Favorites Management.
 * Not implemented — reserved for external engines and BCM modules.
 */

/** Recommendation Engine — personalized suggestions from wishlist. */
export interface IFavoritesRecommendationEngine {
  recommendFromWishlist(customerId: string, productIds: readonly string[]): Promise<readonly string[]>;
}

/** Analytics BCM — wishlist funnel and conversion tracking. */
export interface IFavoritesAnalyticsContext {
  trackWishlistView(customerId: string, itemCount: number): Promise<void>;
}

/** Notification BCM — price drop and back-in-stock alerts for favorites. */
export interface IFavoritesNotificationProvider {
  notifyPriceDrop(customerId: string, productId: string): Promise<void>;
  notifyBackInStock(customerId: string, productId: string): Promise<void>;
}

/** Experience Engine — wishlist UX enrichment (badges, sorting). */
export interface IFavoritesExperienceEnricher {
  enrichFavoritesList<T extends { productId: string }>(items: readonly T[]): Promise<readonly T[]>;
}
