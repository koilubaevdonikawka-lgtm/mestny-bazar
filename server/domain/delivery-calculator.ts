import type { DeliveryFeeQuote, DeliveryTariffDTO } from "@shared/contracts/delivery";

export interface DeliveryCalculatorInput {
  zoneId: string;
  zoneName: string;
  tariff: DeliveryTariffDTO;
  subtotal: number;
  /** Resolved server-side from real product weights (CD-01) — see DeliveryPricingContext. */
  totalWeightKg: number;
  /**
   * Only meaningful for pricingModel BY_DISTANCE. Undefined today — no
   * geocoding provider is wired (docs/delivery/delivery-future-roadmap.md,
   * ADR candidate #1) — kept for a future BY_DISTANCE re-introduction, but
   * unused by the current weight-based formula below.
   */
  distanceKm?: number;
}

/** 60 сом покрывает заказ весом до 40 кг включительно; каждый следующий
 * (частичный — округляется вверх) килограмм добавляет ещё 1 сом. Продуктовое
 * решение этапа "весовая доставка" — фиксированная глобальная формула, не
 * настраиваемая по тарифу/зоне (см. отчёт задачи). */
const WEIGHT_INCLUDED_KG = 40;
const BASE_FEE = 60;
const PRICE_PER_EXTRA_KG = 1;

/**
 * Pure, side-effect-free — no DB/network access, mirrors PricingService's
 * existing calculateSubtotal/calculateTotal. docs/delivery/delivery-pricing.md
 * — "Delivery Calculator".
 *
 * Этап "весовая доставка": fee is now always the fixed weight formula below
 * — tariff.basePrice/pricingModel/pricePerKm are deliberately not read here
 * anymore (still stored and admin-editable, simply unused by this
 * calculation for now — see the task report for the full rationale).
 * minOrderForFreeDelivery is likewise no longer applied — isFree is always
 * false and freeFrom always null in the returned quote, so as not to
 * advertise a threshold that no longer zeroes the fee; the tariff's stored
 * value itself is untouched, ready for a future re-enable.
 */
export class DeliveryCalculator {
  calculate(input: DeliveryCalculatorInput): DeliveryFeeQuote {
    const { tariff, subtotal, totalWeightKg } = input;

    return {
      zoneId: input.zoneId,
      zoneName: input.zoneName,
      tariffId: tariff.id,
      tariffName: tariff.name,
      fee: this.calculateWeightBasedFee(totalWeightKg),
      freeFrom: null,
      subtotal,
      isFree: false,
      eta: { minMinutes: tariff.etaMinMinutes, maxMinutes: tariff.etaMaxMinutes },
    };
  }

  private calculateWeightBasedFee(totalWeightKg: number): number {
    if (totalWeightKg <= WEIGHT_INCLUDED_KG) return BASE_FEE;
    const extraKg = Math.ceil(totalWeightKg - WEIGHT_INCLUDED_KG);
    return BASE_FEE + extraKg * PRICE_PER_EXTRA_KG;
  }
}

/** Shared by checkout.service.ts (already has resolved product records) and
 * delivery-pricing.executor.ts (resolves its own, for the buyer-facing
 * preview) — the one place order weight is summed, so both paths can never
 * diverge on rounding/null-handling. */
export function sumOrderWeightKg(
  items: Array<{ weightKg: number | null; quantity: number }>,
): number {
  return items.reduce((sum, item) => sum + (item.weightKg ?? 0) * item.quantity, 0);
}
