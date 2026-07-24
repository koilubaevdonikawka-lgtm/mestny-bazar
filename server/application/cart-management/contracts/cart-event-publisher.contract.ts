/** Cart lifecycle events — replace with Notification BCM later. */
export interface ICartEventPublisher {
  publishItemAdded(customerId: string, productId: string, quantity: number): Promise<void>;
  publishItemUpdated(customerId: string, productId: string, quantity: number): Promise<void>;
  publishItemRemoved(customerId: string, productId: string): Promise<void>;
  publishCartCleared(customerId: string, removedCount: number): Promise<void>;
}
