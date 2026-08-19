import type { DeliveryFeeQuote } from "@shared/contracts/delivery";
import type { IDeliveryPricingEngine } from "@server/ports/delivery-pricing-engine.port";

export class PricingService {
  constructor(private readonly deliveryPricingEngine: IDeliveryPricingEngine) {}

  /** Sole path to a delivery fee (docs/delivery/delivery-pricing.md) — never computed inline elsewhere. totalWeightKg must already be resolved server-side from real product weights (CD-01) by the caller. */
  async calculateDeliveryFee(
    zoneId: string,
    subtotal: number,
    totalWeightKg: number,
  ): Promise<DeliveryFeeQuote> {
    return this.deliveryPricingEngine.calculate({ zoneId, subtotal, totalWeightKg });
  }

  calculateSubtotal(items: Array<{ price: number; quantity: number }>): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /** discount defaults to 0 — existing callers are unaffected (marketing.md coupon support). */
  calculateTotal(subtotal: number, deliveryFee: number, discount = 0): number {
    return Math.max(0, subtotal + deliveryFee - discount);
  }
}
