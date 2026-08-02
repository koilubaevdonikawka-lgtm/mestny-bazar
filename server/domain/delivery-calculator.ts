import { DeliveryPricingModel } from "@shared/contracts/delivery";
import type { DeliveryFeeQuote, DeliveryTariffDTO } from "@shared/contracts/delivery";

export interface DeliveryCalculatorInput {
  zoneId: string;
  zoneName: string;
  tariff: DeliveryTariffDTO;
  subtotal: number;
  /**
   * Only meaningful for pricingModel BY_DISTANCE. Undefined today — no
   * geocoding provider is wired (docs/delivery/delivery-future-roadmap.md,
   * ADR candidate #1) — the formula is implemented and tested, but nothing
   * in Этап 2 can ever supply a non-zero value.
   */
  distanceKm?: number;
}

/**
 * Pure, side-effect-free — no BD/network access, mirrors PricingService's
 * existing calculateSubtotal/calculateTotal. docs/delivery/delivery-pricing.md
 * — "Delivery Calculator".
 */
export class DeliveryCalculator {
  calculate(input: DeliveryCalculatorInput): DeliveryFeeQuote {
    const { tariff, subtotal } = input;
    const baseFee = this.calculateBaseFee(tariff, input.distanceKm ?? 0);

    const isFree =
      tariff.minOrderForFreeDelivery != null && subtotal >= tariff.minOrderForFreeDelivery;
    const fee = isFree ? 0 : baseFee;

    return {
      zoneId: input.zoneId,
      zoneName: input.zoneName,
      tariffId: tariff.id,
      tariffName: tariff.name,
      fee: Math.max(0, fee),
      freeFrom: tariff.minOrderForFreeDelivery,
      subtotal,
      isFree,
      eta: { minMinutes: tariff.etaMinMinutes, maxMinutes: tariff.etaMaxMinutes },
    };
  }

  private calculateBaseFee(tariff: DeliveryTariffDTO, distanceKm: number): number {
    switch (tariff.pricingModel) {
      case DeliveryPricingModel.BY_DISTANCE:
        return tariff.basePrice + (tariff.pricePerKm ?? 0) * distanceKm;
      case DeliveryPricingModel.FIXED:
      case DeliveryPricingModel.BY_ZONE:
      default:
        return tariff.basePrice;
    }
  }
}
