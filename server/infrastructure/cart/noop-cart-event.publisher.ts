import type { ICartEventPublisher } from "@server/application/cart-management/contracts/cart-event-publisher.contract";

/** No-op event publisher until Notification BCM is connected. */
export class NoopCartEventPublisher implements ICartEventPublisher {
  async publishItemAdded(
    _customerId: string,
    _productId: string,
    _quantity: number,
  ): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishItemUpdated(
    _customerId: string,
    _productId: string,
    _quantity: number,
  ): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishItemRemoved(_customerId: string, _productId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishCartCleared(_customerId: string, _removedCount: number): Promise<void> {
    // Reserved for Notification BCM integration.
  }
}
