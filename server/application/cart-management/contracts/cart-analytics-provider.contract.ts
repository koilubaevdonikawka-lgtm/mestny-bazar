/** Cart analytics — replace with Analytics BCM later. */
export interface ICartAnalyticsProvider {
  trackItemAdded(customerId: string, productId: string, quantity: number): Promise<void>;
  trackItemUpdated(customerId: string, productId: string, quantity: number): Promise<void>;
  trackItemRemoved(customerId: string, productId: string): Promise<void>;
  trackCartCleared(customerId: string, removedCount: number): Promise<void>;
  trackCartValidated(customerId: string, valid: boolean, issueCount: number): Promise<void>;
}
