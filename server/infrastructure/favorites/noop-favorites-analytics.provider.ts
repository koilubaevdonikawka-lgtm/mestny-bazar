import type { IFavoritesAnalyticsProvider } from "@server/application/favorites-management/contracts/favorites-analytics-provider.contract";

/** No-op analytics provider until Analytics BCM is connected. */
export class NoopFavoritesAnalyticsProvider implements IFavoritesAnalyticsProvider {
  async trackAdded(_customerId: string, _productId: string): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async trackRemoved(_customerId: string, _productId: string): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async trackCleared(_customerId: string, _removedCount: number): Promise<void> {
    // Reserved for Analytics BCM integration.
  }
}
