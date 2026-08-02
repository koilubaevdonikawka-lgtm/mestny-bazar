import type { DeliveryFeeQuote } from "@shared/contracts/delivery";

export interface DeliveryPricingContext {
  zoneId: string;
  subtotal: number;
  /** Defaults to "now" — exposed so admin Preview (delivery-api.md) can price a future/past date (e.g. a holiday tariff). */
  orderDate?: string;
  customerSegment?: "RETAIL" | "CORPORATE";
}

/** docs/delivery/delivery-pricing.md — "Delivery Pricing Engine". Sole entry point for computing a delivery fee — CheckoutService and the buyer/admin API both call this, never a repository directly (no duplicate calculation). */
export interface IDeliveryPricingEngine {
  calculate(context: DeliveryPricingContext): Promise<DeliveryFeeQuote>;
}
