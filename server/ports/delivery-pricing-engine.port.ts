import type { DeliveryFeeQuote } from "@shared/contracts/delivery";

export interface DeliveryPricingContext {
  zoneId: string;
  subtotal: number;
  /**
   * Resolved server-side by the caller (checkout.service.ts or
   * delivery-pricing.executor.ts) from each cart line's real product.weightKg
   * — never a client-supplied number (CD-01). Required, not optional: a
   * caller must make a deliberate choice (0 for "no items/weights"), not
   * silently fall back to it.
   */
  totalWeightKg: number;
  /** Defaults to "now" — exposed so admin Preview (delivery-api.md) can price a future/past date (e.g. a holiday tariff). */
  orderDate?: string;
  customerSegment?: "RETAIL" | "CORPORATE";
}

/** docs/delivery/delivery-pricing.md — "Delivery Pricing Engine". Sole entry point for computing a delivery fee — CheckoutService and the buyer/admin API both call this, never a repository directly (no duplicate calculation). */
export interface IDeliveryPricingEngine {
  calculate(context: DeliveryPricingContext): Promise<DeliveryFeeQuote>;
}
