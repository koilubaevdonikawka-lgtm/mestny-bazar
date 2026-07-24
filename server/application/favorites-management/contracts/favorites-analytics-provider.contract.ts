/** Favorites analytics — replace with Analytics BCM later. */
export interface IFavoritesAnalyticsProvider {
  trackAdded(customerId: string, productId: string): Promise<void>;
  trackRemoved(customerId: string, productId: string): Promise<void>;
  trackCleared(customerId: string, removedCount: number): Promise<void>;
}
