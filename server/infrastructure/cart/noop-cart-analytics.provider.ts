import type { ICartAnalyticsProvider } from "@server/application/cart-management/contracts/cart-analytics-provider.contract";

/** No-op analytics provider until Analytics BCM is connected. */
export class NoopCartAnalyticsProvider implements ICartAnalyticsProvider {
  async trackItemAdded(
    _customerId: string,
    _productId: string,
    _quantity: number,
  ): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async trackItemUpdated(
    _customerId: string,
    _productId: string,
    _quantity: number,
  ): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async trackItemRemoved(_customerId: string, _productId: string): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async trackCartCleared(_customerId: string, _removedCount: number): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async trackCartValidated(
    _customerId: string,
    _valid: boolean,
    _issueCount: number,
  ): Promise<void> {
    // Reserved for Analytics BCM integration.
  }
}
