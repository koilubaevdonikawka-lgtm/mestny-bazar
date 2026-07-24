/** Checkout lifecycle events — replace with Notification BCM later. */
export interface ICheckoutEventPublisher {
  publishCreated(checkoutId: string, customerId: string): Promise<void>;
  publishValidated(checkoutId: string, valid: boolean): Promise<void>;
  publishRefreshed(checkoutId: string): Promise<void>;
  publishCancelled(checkoutId: string, customerId: string): Promise<void>;
}
