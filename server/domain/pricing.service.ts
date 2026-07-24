import type { DeliveryFeeQuote } from "@shared/contracts/delivery";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";

export class PricingService {
  constructor(private readonly zones: IDeliveryZoneRepository) {}

  async calculateDeliveryFee(zoneId: string, subtotal: number): Promise<DeliveryFeeQuote> {
    return this.zones.calculateFee(zoneId, subtotal);
  }

  calculateSubtotal(items: Array<{ price: number; quantity: number }>): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  calculateTotal(subtotal: number, deliveryFee: number): number {
    return subtotal + deliveryFee;
  }
}
