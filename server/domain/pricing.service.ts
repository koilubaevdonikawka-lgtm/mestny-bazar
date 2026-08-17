import type { DeliveryFeeQuote } from "@shared/contracts/delivery";
import type { IDeliveryPricingEngine } from "@server/ports/delivery-pricing-engine.port";

export class PricingService {
  constructor(private readonly deliveryPricingEngine: IDeliveryPricingEngine) {}

  /** Sole path to a delivery fee (docs/delivery/delivery-pricing.md) — never computed inline elsewhere. */
  async calculateDeliveryFee(zoneId: string, subtotal: number): Promise<DeliveryFeeQuote> {
    return this.deliveryPricingEngine.calculate({ zoneId, subtotal });
  }

  calculateSubtotal(items: Array<{ price: number; quantity: number }>): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /** discount defaults to 0 — existing callers are unaffected (marketing.md coupon support). */
  calculateTotal(subtotal: number, deliveryFee: number, discount = 0): number {
    return Math.max(0, subtotal + deliveryFee - discount);
  }
}
