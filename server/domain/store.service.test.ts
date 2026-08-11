import { describe, expect, it, vi } from "vitest";
import { StoreService } from "@server/domain/store.service";
import { DeliveryValidationError, StoreNotFoundError } from "@server/domain/delivery.errors";
import type { IStoreRepository } from "@server/ports/store.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { StoreDTO } from "@shared/contracts/delivery";

function makeStore(overrides: Partial<StoreDTO> = {}): StoreDTO {
  return {
    id: "store-1",
    cityId: "city-1",
    name: "Склад на Токтогула",
    address: "ул. Токтогула, 1",
    lat: null,
    lng: null,
    isActive: true,
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<IStoreRepository> = {}): IStoreRepository {
  return {
    listAll: vi.fn(async () => []),
    getById: vi.fn(async () => makeStore()),
    create: vi.fn(async () => makeStore()),
    update: vi.fn(async () => makeStore()),
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

describe("StoreService.listStores", () => {
  it("delegates to the repository", async () => {
    const stores = [makeStore(), makeStore({ id: "store-2" })];
    const repo = fakeRepo({ listAll: vi.fn(async () => stores) });
    const service = new StoreService(repo, fakeEventBus());

    expect(await service.listStores()).toBe(stores);
  });
});

describe("StoreService.createStore", () => {
  const validInput = { cityId: "city-1", name: "Склад", address: "ул. Токтогула, 1" };

  it("rejects a name shorter than 2 characters", async () => {
    const repo = fakeRepo();
    const service = new StoreService(repo, fakeEventBus());

    await expect(service.createStore({ ...validInput, name: "A" })).rejects.toBeInstanceOf(
      DeliveryValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("rejects a blank address", async () => {
    const repo = fakeRepo();
    const service = new StoreService(repo, fakeEventBus());

    await expect(service.createStore({ ...validInput, address: "   " })).rejects.toBeInstanceOf(
      DeliveryValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("publishes delivery.store.created on success", async () => {
    const store = makeStore();
    const repo = fakeRepo({ create: vi.fn(async () => store) });
    const events = fakeEventBus();
    const service = new StoreService(repo, events);

    await service.createStore(validInput);
    expect(events.publish).toHaveBeenCalledWith({ type: "delivery.store.created", store });
  });

  it("creates a store without coordinates (lat/lng nullable — geocoding is a later sub-stage)", async () => {
    const repo = fakeRepo();
    const service = new StoreService(repo, fakeEventBus());

    await service.createStore(validInput);
    expect(repo.create).toHaveBeenCalledWith(validInput);
  });
});

describe("StoreService.updateStore", () => {
  it("throws StoreNotFoundError when the store does not exist", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new StoreService(repo, fakeEventBus());

    await expect(service.updateStore({ id: "missing" })).rejects.toBeInstanceOf(StoreNotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("validates a new name before delegating to the repository", async () => {
    const repo = fakeRepo();
    const service = new StoreService(repo, fakeEventBus());

    await expect(service.updateStore({ id: "store-1", name: "A" })).rejects.toBeInstanceOf(
      DeliveryValidationError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("allows updating just the coordinates", async () => {
    const repo = fakeRepo();
    const service = new StoreService(repo, fakeEventBus());

    await service.updateStore({ id: "store-1", lat: 42.87, lng: 74.59 });
    expect(repo.update).toHaveBeenCalledWith({ id: "store-1", lat: 42.87, lng: 74.59 });
  });

  it("publishes delivery.store.updated on success", async () => {
    const updated = makeStore({ isActive: false });
    const repo = fakeRepo({ update: vi.fn(async () => updated) });
    const events = fakeEventBus();
    const service = new StoreService(repo, events);

    await service.updateStore({ id: "store-1", isActive: false });
    expect(events.publish).toHaveBeenCalledWith({ type: "delivery.store.updated", store: updated });
  });
});
