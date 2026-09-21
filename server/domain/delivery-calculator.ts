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

/**
 * Задача №296 — вся весовая формула читается с тарифа: basePrice (сом за заказ
 * до порога включительно), weightIncludedKg (порог, кг) и weightExtraFeePerKg
 * (доплата за каждый следующий, округлённый вверх, килограмм). Значения ниже —
 * только запасные для пустых (null) полей тарифа; они совпадают с прежней
 * зашитой формулой (порог 40 кг, +1 сом/кг), поэтому пустое поле не меняет цену.
 * basePrice в БД NOT NULL, его "запасного" значения нет — 0 сом это законная
 * цена; прежние 60 сом выставлены в самих тарифах данными (см. отчёт Задачи №296).
 */
const DEFAULT_WEIGHT_INCLUDED_KG = 40;
const DEFAULT_PRICE_PER_EXTRA_KG = 1;

/**
 * Pure, side-effect-free — no DB/network access, mirrors PricingService's
 * existing calculateSubtotal/calculateTotal. docs/delivery/delivery-pricing.md
 * — "Delivery Calculator".
 *
 * Этап "весовая доставка": fee is always the weight formula below —
 * tariff.pricingModel/pricePerKm are deliberately not read here (still stored
 * and admin-editable, simply unused by this calculation for now). The tariff
 * fields it does read are basePrice, weightIncludedKg and weightExtraFeePerKg.
 * minOrderForFreeDelivery is likewise no longer applied — isFree is always
 * false and freeFrom always null in the returned quote, so as not to advertise
 * a threshold that no longer zeroes the fee; the tariff's stored value itself
 * is untouched, ready for a future re-enable.
 */
export class DeliveryCalculator {
  calculate(input: DeliveryCalculatorInput): DeliveryFeeQuote {
    const { tariff, subtotal, totalWeightKg } = input;

    return {
      zoneId: input.zoneId,
      zoneName: input.zoneName,
      tariffId: tariff.id,
      tariffName: tariff.name,
      fee: this.calculateWeightBasedFee(totalWeightKg, tariff),
      freeFrom: null,
      subtotal,
      isFree: false,
      eta: { minMinutes: tariff.etaMinMinutes, maxMinutes: tariff.etaMaxMinutes },
    };
  }

  private calculateWeightBasedFee(totalWeightKg: number, tariff: DeliveryTariffDTO): number {
    const includedKg = tariff.weightIncludedKg ?? DEFAULT_WEIGHT_INCLUDED_KG;
    const pricePerExtraKg = tariff.weightExtraFeePerKg ?? DEFAULT_PRICE_PER_EXTRA_KG;
    if (totalWeightKg <= includedKg) return tariff.basePrice;
    const extraKg = Math.ceil(totalWeightKg - includedKg);
    return tariff.basePrice + extraKg * pricePerExtraKg;
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
