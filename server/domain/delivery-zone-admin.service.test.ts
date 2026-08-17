import { describe, expect, it, vi } from "vitest";
import { DeliveryZoneAdminService } from "@server/domain/delivery-zone-admin.service";
import { DeliveryValidationError, DeliveryZoneNotFoundError } from "@server/domain/delivery.errors";
import type { IAdminDeliveryZoneRepository } from "@server/ports/delivery-zone-admin.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { DeliveryZoneDTO } from "@shared/contracts/delivery";

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

function fakeRepo(
  overrides: Partial<IAdminDeliveryZoneRepository> = {},
): IAdminDeliveryZoneRepository {
  return {
    listAll: vi.fn(async () => []),
    getById: vi.fn(async () => makeZone()),
    create: vi.fn(async () => makeZone()),
    update: vi.fn(async () => makeZone()),
    deactivate: vi.fn(async () => makeZone({ isActive: false })),
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

describe("DeliveryZoneAdminService.createZone", () => {
  it("rejects a name shorter than 2 characters", async () => {
    const repo = fakeRepo();
    const service = new DeliveryZoneAdminService(repo, fakeEventBus());

    await expect(service.createZone({ cityId: "city-1", name: "A" })).rejects.toBeInstanceOf(
      DeliveryValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("publishes delivery.zone.created on success", async () => {
    const zone = makeZone();
    const repo = fakeRepo({ create: vi.fn(async () => zone) });
    const events = fakeEventBus();
    const service = new DeliveryZoneAdminService(repo, events);

    await service.createZone({ cityId: "city-1", name: "Центр" });
    expect(events.publish).toHaveBeenCalledWith({ type: "delivery.zone.created", zone });
  });
});

describe("DeliveryZoneAdminService.updateZone", () => {
  it("throws DeliveryZoneNotFoundError when the zone does not exist", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new DeliveryZoneAdminService(repo, fakeEventBus());

    await expect(service.updateZone({ id: "missing" })).rejects.toBeInstanceOf(
      DeliveryZoneNotFoundError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("publishes delivery.zone.updated on success", async () => {
    const updated = makeZone({ name: "Обновлённая" });
    const repo = fakeRepo({ update: vi.fn(async () => updated) });
    const events = fakeEventBus();
    const service = new DeliveryZoneAdminService(repo, events);

    await service.updateZone({ id: "zone-1", name: "Обновлённая" });
    expect(events.publish).toHaveBeenCalledWith({ type: "delivery.zone.updated", zone: updated });
  });
});

describe("DeliveryZoneAdminService.deactivateZone", () => {
  it("throws DeliveryZoneNotFoundError when the zone does not exist", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new DeliveryZoneAdminService(repo, fakeEventBus());

    await expect(service.deactivateZone("missing")).rejects.toBeInstanceOf(
      DeliveryZoneNotFoundError,
    );
    expect(repo.deactivate).not.toHaveBeenCalled();
  });

  it("publishes delivery.zone.deactivated on success", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = new DeliveryZoneAdminService(repo, events);

    await service.deactivateZone("zone-1");
    expect(events.publish).toHaveBeenCalledWith({
      type: "delivery.zone.deactivated",
      zoneId: "zone-1",
    });
  });
});
