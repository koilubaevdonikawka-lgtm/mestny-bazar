import { describe, expect, it } from "vitest";
import type {
  CityDTO,
  DeliveryTariffDTO,
  DeliveryZoneDTO,
  StoreDTO,
} from "@shared/contracts/delivery";
import {
  DELIVERY_WEIGHT_RULE,
  deliveryFeeRule,
  deriveSimpleDeliverySetup,
  extraFeePerKg,
  includedKgOf,
  parseFeeInput,
} from "@/lib/delivery-admin-view";

const city = (id = "c1"): CityDTO => ({
  id,
  name: "Бишкек",
  slug: "bishkek",
  timezone: "Asia/Bishkek",
  sortOrder: 1,
  isActive: true,
});
const zone = (id: string, isActive = true): DeliveryZoneDTO => ({
  id,
  cityId: "c1",
  storeId: null,
  name: `Зона ${id}`,
  sortOrder: 1,
  isActive,
});
const tariff = (id: string, zoneId: string | null, isActive = true): DeliveryTariffDTO => ({
  id,
  zoneId,
  name: "Стандартный",
  tariffType: "STANDARD",
  pricingModel: "FIXED",
  basePrice: 1,
  pricePerKm: null,
  minOrderForFreeDelivery: null,
  minOrderAmount: null,
  weightExtraFeePerKg: null,
  weightIncludedKg: null,
  etaMinMinutes: null,
  etaMaxMinutes: null,
  validFrom: null,
  validTo: null,
  priority: 90,
  isActive,
});
const store = (id: string): StoreDTO => ({
  id,
  cityId: "c1",
  name: "Склад",
  address: "Кант, базар",
  lat: null,
  lng: null,
  isActive: true,
});

describe("deriveSimpleDeliverySetup (Задача №295)", () => {
  it("today's real data shape: 1 city, 1 active zone (+ switched-off ones), its tariff, NO store yet → simple", () => {
    const setup = deriveSimpleDeliverySetup({
      cities: [city()],
      stores: [],
      zones: [zone("center", false), zone("suburb", false), zone("kant", true)],
      tariffs: [
        tariff("t-center", "center", false),
        tariff("t-suburb", "suburb", true),
        tariff("t-kant", "kant", true),
      ],
    });
    // t-suburb is active but bound to a switched-off zone → not applicable to "kant"
    expect(setup?.zone.id).toBe("kant");
    expect(setup?.tariff.id).toBe("t-kant");
    expect(setup?.store).toBeNull();
    expect(setup?.hiddenInactiveZones).toBe(2);
    expect(setup?.hiddenOtherTariffs).toBe(2);
  });

  it("one dispatch point is still simple and is carried through", () => {
    const setup = deriveSimpleDeliverySetup({
      cities: [city()],
      stores: [store("s1")],
      zones: [zone("kant")],
      tariffs: [tariff("t1", "kant")],
    });
    expect(setup?.store?.id).toBe("s1");
  });

  it("a platform-wide default tariff (zoneId null) counts as the zone's tariff", () => {
    expect(
      deriveSimpleDeliverySetup({
        cities: [city()],
        stores: [],
        zones: [zone("kant")],
        tariffs: [tariff("default", null)],
      })?.tariff.id,
    ).toBe("default");
  });

  it("a second ACTIVE zone switches back to the full interface", () => {
    expect(
      deriveSimpleDeliverySetup({
        cities: [city()],
        stores: [],
        zones: [zone("kant"), zone("center")],
        tariffs: [tariff("t1", "kant"), tariff("t2", "center")],
      }),
    ).toBeNull();
  });

  it("a second active tariff for the same zone switches to the full interface", () => {
    expect(
      deriveSimpleDeliverySetup({
        cities: [city()],
        stores: [],
        zones: [zone("kant")],
        tariffs: [tariff("t1", "kant"), tariff("t2", "kant")],
      }),
    ).toBeNull();
  });

  it("a default tariff PLUS a zone tariff is a real choice → full interface", () => {
    expect(
      deriveSimpleDeliverySetup({
        cities: [city()],
        stores: [],
        zones: [zone("kant")],
        tariffs: [tariff("t1", "kant"), tariff("default", null)],
      }),
    ).toBeNull();
  });

  it("a second city or a second dispatch point switches to the full interface", () => {
    const base = { stores: [], zones: [zone("kant")], tariffs: [tariff("t1", "kant")] };
    expect(deriveSimpleDeliverySetup({ ...base, cities: [city("c1"), city("c2")] })).toBeNull();
    expect(
      deriveSimpleDeliverySetup({ ...base, cities: [city()], stores: [store("a"), store("b")] }),
    ).toBeNull();
  });

  it("nothing usable yet (no active zone, no tariff, no city) stays in the full interface so it can be set up", () => {
    expect(
      deriveSimpleDeliverySetup({ cities: [city()], stores: [], zones: [], tariffs: [] }),
    ).toBeNull();
    expect(
      deriveSimpleDeliverySetup({
        cities: [city()],
        stores: [],
        zones: [zone("kant")],
        tariffs: [],
      }),
    ).toBeNull();
    expect(
      deriveSimpleDeliverySetup({
        cities: [],
        stores: [],
        zones: [zone("kant")],
        tariffs: [tariff("t", "kant")],
      }),
    ).toBeNull();
  });
});

describe("delivery fee wording matches the real calculator", () => {
  // Dynamic import, not a static one: src/** may not statically import server/**
  // (no-restricted-imports); this test deliberately reaches across to catch drift.
  const fee = async (kg: number, overrides: Partial<DeliveryTariffDTO>) => {
    const { DeliveryCalculator } = await import("@server/domain/delivery-calculator");
    return new DeliveryCalculator().calculate({
      zoneId: "z",
      zoneName: "Зона",
      tariff: { ...tariff("t", "z"), basePrice: DELIVERY_WEIGHT_RULE.defaultBaseFee, ...overrides },
      subtotal: 500,
      totalWeightKg: kg,
    }).fee;
  };

  it("a tariff with empty weight fields charges the same as before the fields were editable", async () => {
    const { defaultBaseFee, defaultIncludedKg, defaultExtraPerKg } = DELIVERY_WEIGHT_RULE;
    expect(await fee(defaultIncludedKg, {})).toBe(defaultBaseFee);
    expect(await fee(1, {})).toBe(defaultBaseFee);
    expect(await fee(defaultIncludedKg + 1, {})).toBe(defaultBaseFee + defaultExtraPerKg);
  });

  it("the admin wording helpers give the numbers the calculator really uses", async () => {
    const custom = { basePrice: 90, weightIncludedKg: 25, weightExtraFeePerKg: 3 };
    expect(includedKgOf(custom)).toBe(25);
    expect(extraFeePerKg(custom)).toBe(3);
    expect(await fee(25, custom)).toBe(90);
    expect(await fee(28, custom)).toBe(90 + 3 * 3);
    expect(includedKgOf({ weightIncludedKg: null })).toBe(DELIVERY_WEIGHT_RULE.defaultIncludedKg);
    expect(extraFeePerKg({ weightExtraFeePerKg: null })).toBe(
      DELIVERY_WEIGHT_RULE.defaultExtraPerKg,
    );
  });
});

describe("parseFeeInput", () => {
  it("accepts numbers >= 0, with a comma or a dot as the decimal separator", () => {
    expect(parseFeeInput("60", false)).toBe(60);
    expect(parseFeeInput("0", false)).toBe(0);
    expect(parseFeeInput("2,5", true)).toBe(2.5);
  });

  it("treats an empty optional field as null (use the default) and an empty required field as invalid", () => {
    expect(parseFeeInput("  ", true)).toBeNull();
    expect(parseFeeInput("", false)).toBeUndefined();
  });

  it("rejects negatives and non-numbers", () => {
    expect(parseFeeInput("-1", true)).toBeUndefined();
    expect(parseFeeInput("abc", true)).toBeUndefined();
  });
});

describe("deliveryFeeRule", () => {
  it("returns the tariff's own numbers", () => {
    expect(
      deliveryFeeRule({ basePrice: 100, weightIncludedKg: 40, weightExtraFeePerKg: 3 }),
    ).toEqual({ baseFee: 100, includedKg: 40, extraPerKg: 3 });
  });

  it("resolves an empty threshold and rate to the calculator defaults", () => {
    expect(
      deliveryFeeRule({ basePrice: 60, weightIncludedKg: null, weightExtraFeePerKg: null }),
    ).toEqual({
      baseFee: 60,
      includedKg: DELIVERY_WEIGHT_RULE.defaultIncludedKg,
      extraPerKg: DELIVERY_WEIGHT_RULE.defaultExtraPerKg,
    });
  });
});
