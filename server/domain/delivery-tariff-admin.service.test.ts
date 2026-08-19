import { describe, expect, it, vi } from "vitest";
import { DeliveryTariffAdminService } from "@server/domain/delivery-tariff-admin.service";
import {
  DeliveryTariffNotFoundError,
  DeliveryValidationError,
} from "@server/domain/delivery.errors";
import type { IDeliveryTariffRepository } from "@server/ports/delivery-tariff.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
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
    weightExtraFeePerKg: null,
    etaMinMinutes: 30,
    etaMaxMinutes: 60,
    validFrom: null,
    validTo: null,
    priority: 90,
    isActive: true,
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<IDeliveryTariffRepository> = {}): IDeliveryTariffRepository {
  return {
    listAll: vi.fn(async () => []),
    listActiveForZone: vi.fn(async () => []),
    getById: vi.fn(async () => makeTariff()),
    create: vi.fn(async () => makeTariff()),
    update: vi.fn(async () => makeTariff()),
    ...overrides,
  };
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

describe("DeliveryTariffAdminService.createTariff", () => {
  it("rejects a negative base price", async () => {
    const repo = fakeRepo();
    const service = new DeliveryTariffAdminService(repo, fakeEventBus());

    await expect(service.createTariff({ name: "Standard", basePrice: -10 })).rejects.toBeInstanceOf(
      DeliveryValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("publishes delivery.tariff.created on success", async () => {
    const tariff = makeTariff();
    const repo = fakeRepo({ create: vi.fn(async () => tariff) });
    const events = fakeEventBus();
    const service = new DeliveryTariffAdminService(repo, events);

    await service.createTariff({ name: "Standard", basePrice: 150 });
    expect(events.publish).toHaveBeenCalledWith({ type: "delivery.tariff.created", tariff });
  });
});

describe("DeliveryTariffAdminService.updateTariff", () => {
  it("throws DeliveryTariffNotFoundError when the tariff does not exist", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new DeliveryTariffAdminService(repo, fakeEventBus());

    await expect(service.updateTariff({ id: "missing" })).rejects.toBeInstanceOf(
      DeliveryTariffNotFoundError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("publishes delivery.tariff.updated on success", async () => {
    const updated = makeTariff({ basePrice: 200 });
    const repo = fakeRepo({ update: vi.fn(async () => updated) });
    const events = fakeEventBus();
    const service = new DeliveryTariffAdminService(repo, events);

    await service.updateTariff({ id: "tariff-1", basePrice: 200 });
    expect(events.publish).toHaveBeenCalledWith({
      type: "delivery.tariff.updated",
      tariff: updated,
    });
  });
});
