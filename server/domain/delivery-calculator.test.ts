import { describe, expect, it } from "vitest";
import { DeliveryCalculator, sumOrderWeightKg } from "@server/domain/delivery-calculator";
import type { DeliveryTariffDTO } from "@shared/contracts/delivery";

function makeTariff(overrides: Partial<DeliveryTariffDTO> = {}): DeliveryTariffDTO {
  return {
    id: "tariff-1",
    zoneId: "zone-1",
    name: "Standard",
    tariffType: "STANDARD",
    pricingModel: "FIXED",
    basePrice: 60,
    pricePerKm: null,
    minOrderForFreeDelivery: null,
    minOrderAmount: null,
    weightExtraFeePerKg: null,
    weightIncludedKg: null,
    etaMinMinutes: 30,
    etaMaxMinutes: 60,
    validFrom: null,
    validTo: null,
    priority: 90,
    isActive: true,
    ...overrides,
  };
}

/**
 * Этап "весовая доставка" + Задача №296 — the fee is the weight formula
 * (basePrice up to and including weightIncludedKg, then weightExtraFeePerKg per
 * extra kg rounded up), read from the tariff. A tariff with basePrice 60 and
 * the two weight fields null reproduces the old hardcoded 60 / 40 kg / +1 сом.
 */
describe("DeliveryCalculator", () => {
  it("charges the base 60 for a weightless order (no weights set on any line)", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff(),
      subtotal: 500,
      totalWeightKg: 0,
    });
    expect(quote.fee).toBe(60);
    expect(quote.isFree).toBe(false);
  });

  it("still charges exactly 60 at the 40 kg threshold itself", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff(),
      subtotal: 500,
      totalWeightKg: 40,
    });
    expect(quote.fee).toBe(60);
  });

  it("adds 1 som per whole extra kg above 40", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff(),
      subtotal: 500,
      totalWeightKg: 45,
    });
    expect(quote.fee).toBe(65);
  });

  it("rounds a fractional excess up to the next whole kg", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff(),
      subtotal: 500,
      totalWeightKg: 40.1,
    });
    expect(quote.fee).toBe(61);
  });

  it("charges the tariff's own basePrice — an admin-edited price reaches the buyer", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ basePrice: 100 }),
      subtotal: 500,
      totalWeightKg: 10,
    });
    expect(quote.fee).toBe(100);
  });

  it("does not read pricingModel/pricePerKm — the weight formula applies to every model", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ pricingModel: "BY_DISTANCE", pricePerKm: 500 }),
      subtotal: 500,
      totalWeightKg: 0,
      distanceKm: 10,
    });
    expect(quote.fee).toBe(60);
  });

  it("no longer waives the fee above minOrderForFreeDelivery — isFree is always false, freeFrom always null", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ minOrderForFreeDelivery: 2000 }),
      subtotal: 5000,
      totalWeightKg: 0,
    });
    expect(quote.fee).toBe(60);
    expect(quote.isFree).toBe(false);
    expect(quote.freeFrom).toBeNull();
  });

  it("uses the resolved tariff's weightExtraFeePerKg for the per-kg overage rate (Кант — 2 сом/кг)", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-kant",
      zoneName: "Кант",
      tariff: makeTariff({ weightExtraFeePerKg: 2 }),
      subtotal: 500,
      totalWeightKg: 45,
    });
    expect(quote.fee).toBe(70); // 60 + ceil(45-40) * 2
  });

  it("falls back to the 1 som/kg default when weightExtraFeePerKg is null (every other zone, unchanged)", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ weightExtraFeePerKg: null }),
      subtotal: 500,
      totalWeightKg: 45,
    });
    expect(quote.fee).toBe(65); // 60 + ceil(45-40) * 1
  });

  it("a custom per-kg rate never changes the base 60 fee at or under the 40 kg threshold", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-kant",
      zoneName: "Кант",
      tariff: makeTariff({ weightExtraFeePerKg: 2 }),
      subtotal: 500,
      totalWeightKg: 40,
    });
    expect(quote.fee).toBe(60);
  });

  it("uses the tariff's weightIncludedKg as the threshold (20 kg covered, +1 сом/kg after)", () => {
    const tariff = makeTariff({ weightIncludedKg: 20 });
    const calc = new DeliveryCalculator();
    const feeAt = (totalWeightKg: number) =>
      calc.calculate({ zoneId: "zone-1", zoneName: "Центр", tariff, subtotal: 500, totalWeightKg })
        .fee;
    expect(feeAt(20)).toBe(60);
    expect(feeAt(21)).toBe(61);
    expect(feeAt(40)).toBe(80);
  });

  it("falls back to the 40 kg threshold when weightIncludedKg is null", () => {
    const tariff = makeTariff({ weightIncludedKg: null });
    const calc = new DeliveryCalculator();
    const feeAt = (totalWeightKg: number) =>
      calc.calculate({ zoneId: "zone-1", zoneName: "Центр", tariff, subtotal: 500, totalWeightKg })
        .fee;
    expect(feeAt(40)).toBe(60);
    expect(feeAt(41)).toBe(61);
  });

  it("combines all three admin-editable fields (base 80, 30 kg covered, +3 сом/kg)", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ basePrice: 80, weightIncludedKg: 30, weightExtraFeePerKg: 3 }),
      subtotal: 500,
      totalWeightKg: 34.2,
    });
    expect(quote.fee).toBe(95); // 80 + ceil(34.2 - 30) * 3
  });

  it("supports a 0 сом base price (free base delivery)", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ basePrice: 0 }),
      subtotal: 500,
      totalWeightKg: 10,
    });
    expect(quote.fee).toBe(0);
  });

  it("carries the tariff's ETA through to the quote", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ etaMinMinutes: 20, etaMaxMinutes: 40 }),
      subtotal: 500,
      totalWeightKg: 0,
    });
    expect(quote.eta).toEqual({ minMinutes: 20, maxMinutes: 40 });
  });
});

describe("sumOrderWeightKg", () => {
  it("multiplies each line's weight by its quantity and sums", () => {
    expect(
      sumOrderWeightKg([
        { weightKg: 2, quantity: 3 },
        { weightKg: 1.5, quantity: 2 },
      ]),
    ).toBe(9);
  });

  it("treats a null weightKg as 0", () => {
    expect(
      sumOrderWeightKg([
        { weightKg: null, quantity: 5 },
        { weightKg: 2, quantity: 1 },
      ]),
    ).toBe(2);
  });

  it("returns 0 for an empty order", () => {
    expect(sumOrderWeightKg([])).toBe(0);
  });
});
