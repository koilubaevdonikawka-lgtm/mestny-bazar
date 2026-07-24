/**
 * Future integration ports for Checkout Management.
 * Not implemented — reserved for payment, delivery, and promotion modules.
 */

/** Payment Management — processes payment after checkout confirmation. */
export interface ICheckoutPaymentGateway {
  initiatePayment(checkoutId: string, amount: number, currency: string): Promise<string>;
}

/** Promotion Engine — applies discounts to checkout subtotal. */
export interface ICheckoutPromotionEngine {
  applyPromotions(customerId: string, subtotal: number): Promise<number>;
}

/** Inventory BCM — reserves stock during checkout. */
export interface ICheckoutInventoryContext {
  reserveLines(checkoutId: string, lines: readonly { productId: string; quantity: number }[]): Promise<boolean>;
}

/** Delivery Management — delivery options and fees. */
export interface ICheckoutDeliveryProvider {
  estimateDelivery(customerId: string, checkoutId: string): Promise<number>;
}

/** Notification BCM — checkout status notifications. */
export interface ICheckoutNotificationProvider {
  notifyCheckoutReady(customerId: string, checkoutId: string): Promise<void>;
}

/** Analytics BCM — checkout funnel tracking. */
export interface ICheckoutAnalyticsContext {
  trackCheckoutStarted(customerId: string, checkoutId: string): Promise<void>;
  trackCheckoutAbandoned(customerId: string, checkoutId: string): Promise<void>;
}
