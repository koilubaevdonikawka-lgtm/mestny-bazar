/**
 * Future integration ports for Cart Management.
 * Not implemented — reserved for external engines and BCM modules.
 */

/** Pricing Engine — dynamic pricing and currency conversion. */
export interface ICartPricingEngine {
  resolveUnitPrice(productId: string, customerId: string): Promise<number | null>;
}

/** Promotion Engine — discounts, coupons, bundles. */
export interface ICartPromotionEngine {
  applyPromotions(customerId: string, subtotal: number): Promise<number>;
}

/** Inventory BCM — warehouse-level stock reservation. */
export interface ICartInventoryContext {
  reserveStock(customerId: string, productId: string, quantity: number): Promise<boolean>;
}

/** Recommendation Engine — upsell and cross-sell in cart. */
export interface ICartRecommendationEngine {
  suggestAddons(customerId: string, productIds: readonly string[]): Promise<readonly string[]>;
}

/** Analytics BCM — cart funnel and abandonment tracking. */
export interface ICartAnalyticsContext {
  trackCartView(customerId: string, itemCount: number): Promise<void>;
}

/** Notification BCM — cart reminders and price alerts. */
export interface ICartNotificationProvider {
  notifyCartAbandoned(customerId: string): Promise<void>;
}
