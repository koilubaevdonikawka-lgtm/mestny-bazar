import { describe, expect, it, vi } from "vitest";
import { DeliveryPricingEngine } from "@server/domain/delivery-pricing-engine.service";
import { DeliveryCalculator } from "@server/domain/delivery-calculator";
import { DeliveryNotAllowedError, DeliveryZoneNotFoundError } from "@server/domain/delivery.errors";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";
import type { IDeliveryTariffRepository } from "@server/ports/delivery-tariff.repository";
import type {
  IDeliveryTariffPolicy,
  DeliveryTariffPolicyResult,
} from "@server/ports/delivery-tariff-policy.port";
import type {
  IDeliveryZonePolicy,
  DeliveryZonePolicyResult,
} from "@server/ports/delivery-zone-policy.port";
import type { DeliveryTariffDTO, DeliveryZoneDTO } from "@shared/contracts/delivery";

function makeZone(overrides: Partial<DeliveryZoneDTO> = {}): DeliveryZoneDTO {
  return {
    id: "zone-1",
    cityId: "city-1",
    storeId: null,
    name: "Центр",
    sortOrder: 0,
    isActive: true,
    ...overrides,
  };
}

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

function fakeZones(overrides: Partial<IDeliveryZoneRepository> = {}): IDeliveryZoneRepository {
  return {
    listActive: vi.fn(async () => []),
    getById: vi.fn(async () => makeZone()),
    ...overrides,
  };
}

function fakeTariffs(
  overrides: Partial<IDeliveryTariffRepository> = {},
): IDeliveryTariffRepository {
  return {
    listAll: vi.fn(async () => []),
    listActiveForZone: vi.fn(async () => [makeTariff()]),
    getById: vi.fn(async () => null),
    create: vi.fn(),
    update: vi.fn(),
    ...overrides,
  } as IDeliveryTariffRepository;
}

function fakeTariffPolicy(result: DeliveryTariffPolicyResult): IDeliveryTariffPolicy {
  return { evaluate: vi.fn(() => result) };
}

function fakeZonePolicy(result: DeliveryZonePolicyResult): IDeliveryZonePolicy {
  return {
    can: vi.fn(() => result),
    assert: vi.fn(() => {
      if (!result.allowed) {
        throw new DeliveryNotAllowedError(result.denialCode ?? "DELIVERY_NOT_ALLOWED", "denied");
      }
    }),
  };
}

describe("DeliveryPricingEngine", () => {
  it("throws DeliveryZoneNotFoundError when the zone does not exist", async () => {
    const engine = new DeliveryPricingEngine(
      fakeZones({ getById: vi.fn(async () => null) }),
      fakeTariffs(),
      fakeTariffPolicy({ allowed: true, tariff: makeTariff() }),
      fakeZonePolicy({ allowed: true }),
      new DeliveryCalculator(),
    );

    await expect(
      engine.calculate({ zoneId: "missing", subtotal: 100, totalWeightKg: 0 }),
    ).rejects.toBeInstanceOf(DeliveryZoneNotFoundError);
  });

  it("throws DeliveryNotAllowedError when no tariff applies", async () => {
    const engine = new DeliveryPricingEngine(
      fakeZones(),
      fakeTariffs(),
      fakeTariffPolicy({ allowed: false, denialCode: "NO_STANDARD_TARIFF" }),
      fakeZonePolicy({ allowed: true }),
      new DeliveryCalculator(),
    );

    await expect(
      engine.calculate({ zoneId: "zone-1", subtotal: 100, totalWeightKg: 0 }),
    ).rejects.toBeInstanceOf(DeliveryNotAllowedError);
  });

  it("asserts Zone Policy using the resolved tariff's minOrderAmount, not the zone's own data", async () => {
    const tariff = makeTariff({ minOrderAmount: 500 });
    const zonePolicy = fakeZonePolicy({ allowed: false, denialCode: "MIN_ORDER_AMOUNT_NOT_MET" });
    const engine = new DeliveryPricingEngine(
      fakeZones(),
      fakeTariffs(),
      fakeTariffPolicy({ allowed: true, tariff }),
      zonePolicy,
      new DeliveryCalculator(),
    );

    await expect(
      engine.calculate({ zoneId: "zone-1", subtotal: 100, totalWeightKg: 0 }),
    ).rejects.toBeInstanceOf(DeliveryNotAllowedError);
    expect(zonePolicy.assert).toHaveBeenCalledWith(
      expect.objectContaining({ minOrderAmount: 500, subtotal: 100 }),
    );
  });

  it("returns a full quote when zone exists, tariff resolves, and zone policy allows — fee follows totalWeightKg, not tariff.basePrice", async () => {
    const tariff = makeTariff({ basePrice: 200 });
    const engine = new DeliveryPricingEngine(
      fakeZones(),
      fakeTariffs(),
      fakeTariffPolicy({ allowed: true, tariff }),
      fakeZonePolicy({ allowed: true }),
      new DeliveryCalculator(),
    );

    const quote = await engine.calculate({ zoneId: "zone-1", subtotal: 500, totalWeightKg: 50 });
    expect(quote).toMatchObject({
      zoneId: "zone-1",
      zoneName: "Центр",
      tariffId: "tariff-1",
      fee: 70,
    });
  });

  it("defaults orderDate to now when not supplied, and passes it to the tariff policy", async () => {
    const tariffPolicy = fakeTariffPolicy({ allowed: true, tariff: makeTariff() });
    const engine = new DeliveryPricingEngine(
      fakeZones(),
      fakeTariffs(),
      tariffPolicy,
      fakeZonePolicy({ allowed: true }),
      new DeliveryCalculator(),
    );

    await engine.calculate({ zoneId: "zone-1", subtotal: 500, totalWeightKg: 0 });
    expect(tariffPolicy.evaluate).toHaveBeenCalledWith(
      expect.objectContaining({ orderDate: expect.any(String) }),
    );
  });
});
