import type { IFavoritesEventPublisher } from "@server/application/favorites-management/contracts/favorites-event-publisher.contract";

/** No-op event publisher until Notification BCM is connected. */
export class NoopFavoritesEventPublisher implements IFavoritesEventPublisher {
  async publishAdded(_customerId: string, _productId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishRemoved(_customerId: string, _productId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishCleared(_customerId: string, _removedCount: number): Promise<void> {
    // Reserved for Notification BCM integration.
  }
}
