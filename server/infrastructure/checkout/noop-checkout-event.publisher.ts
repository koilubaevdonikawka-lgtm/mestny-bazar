import type { ICheckoutEventPublisher } from "@server/application/checkout-management/contracts/checkout-event-publisher.contract";

/** No-op event publisher until Notification BCM is connected. */
export class NoopCheckoutEventPublisher implements ICheckoutEventPublisher {
  async publishCreated(_checkoutId: string, _customerId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishValidated(_checkoutId: string, _valid: boolean): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishRefreshed(_checkoutId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }

  async publishCancelled(_checkoutId: string, _customerId: string): Promise<void> {
    // Reserved for Notification BCM integration.
  }
}
