import { describe, expect, it } from "vitest";
import { DeliveryCalculator } from "@server/domain/delivery-calculator";
import type { DeliveryTariffDTO } from "@shared/contracts/delivery";

function makeTariff(overrides: Partial<DeliveryTariffDTO> = {}): DeliveryTariffDTO {
  return {
    id: "tariff-1",
    zoneId: "zone-1",
    name: "Standard",
    tariffType: "STANDARD",
    pricingModel: "FIXED",
    basePrice: 150,
    pricePerKm: null,
    minOrderForFreeDelivery: null,
    minOrderAmount: null,
    etaMinMinutes: 30,
    etaMaxMinutes: 60,
    validFrom: null,
    validTo: null,
    priority: 90,
    isActive: true,
    ...overrides,
  };
}

describe("DeliveryCalculator", () => {
  it("charges the tariff's base price for FIXED pricing", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ basePrice: 150 }),
      subtotal: 500,
    });
    expect(quote.fee).toBe(150);
    expect(quote.isFree).toBe(false);
  });

  it("waives the fee once subtotal meets minOrderForFreeDelivery", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ basePrice: 150, minOrderForFreeDelivery: 2000 }),
      subtotal: 2000,
    });
    expect(quote.fee).toBe(0);
    expect(quote.isFree).toBe(true);
    expect(quote.freeFrom).toBe(2000);
  });

  it("still charges when subtotal is below the free-delivery threshold", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ basePrice: 150, minOrderForFreeDelivery: 2000 }),
      subtotal: 1999,
    });
    expect(quote.fee).toBe(150);
    expect(quote.isFree).toBe(false);
  });

  it("computes BY_DISTANCE as basePrice + pricePerKm * distanceKm", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ pricingModel: "BY_DISTANCE", basePrice: 50, pricePerKm: 10 }),
      subtotal: 500,
      distanceKm: 4,
    });
    expect(quote.fee).toBe(90);
  });

  it("treats BY_DISTANCE with no distance supplied as base price only (no geocoding provider yet)", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ pricingModel: "BY_DISTANCE", basePrice: 50, pricePerKm: 10 }),
      subtotal: 500,
    });
    expect(quote.fee).toBe(50);
  });

  it("carries the tariff's ETA through to the quote", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ etaMinMinutes: 20, etaMaxMinutes: 40 }),
      subtotal: 500,
    });
    expect(quote.eta).toEqual({ minMinutes: 20, maxMinutes: 40 });
  });

  it("never returns a negative fee", () => {
    const quote = new DeliveryCalculator().calculate({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariff: makeTariff({ pricingModel: "BY_DISTANCE", basePrice: 0, pricePerKm: -5 }),
      subtotal: 500,
      distanceKm: 1,
    });
    expect(quote.fee).toBe(0);
  });
});
