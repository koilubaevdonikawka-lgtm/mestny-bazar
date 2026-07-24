/** Domain events for favorites lifecycle — replace with Notification BCM later. */
export interface IFavoritesEventPublisher {
  publishAdded(customerId: string, productId: string): Promise<void>;
  publishRemoved(customerId: string, productId: string): Promise<void>;
  publishCleared(customerId: string, removedCount: number): Promise<void>;
}
