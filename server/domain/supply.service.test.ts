import { describe, expect, it, vi } from "vitest";
import { SupplyService } from "@server/domain/supply.service";
import { InventoryService } from "@server/domain/inventory.service";
import {
  SupplierNotFoundError,
  SupplyNotFoundError,
  SupplyTransitionError,
} from "@server/domain/supplier.errors";
import type { ISupplyRepository } from "@server/ports/supply.repository";
import type { ISupplierRepository } from "@server/ports/supplier.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { IProductRepository, StockReservationItem } from "@server/ports/product.repository";
import type { SupplierDTO, SupplyDTO } from "@shared/contracts/supplier";

function makeSupplier(overrides: Partial<SupplierDTO> = {}): SupplierDTO {
  return {
    id: "supplier-1",
    name: "ОсОО Молоко",
    contactPhone: null,
    contactPerson: null,
    notes: null,
    isActive: true,
    ...overrides,
  };
}

function makeSupply(overrides: Partial<SupplyDTO> = {}): SupplyDTO {
  return {
    id: "supply-1",
    supplierId: "supplier-1",
    status: "DRAFT",
    expectedAt: null,
    items: [{ id: "item-1", productId: "product-1", quantity: 10, purchasePrice: 50 }],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function fakeSupplyRepo(overrides: Partial<ISupplyRepository> = {}): ISupplyRepository {
  return {
    list: vi.fn(async () => []),
    getById: vi.fn(async () => makeSupply()),
    create: vi.fn(async () => makeSupply()),
    updateStatus: vi.fn(async (_id, status) => makeSupply({ status })),
    ...overrides,
  };
}

function fakeSupplierRepo(overrides: Partial<ISupplierRepository> = {}): ISupplierRepository {
  return {
    list: vi.fn(async () => []),
    getById: vi.fn(async () => makeSupplier()),
    create: vi.fn(async () => makeSupplier()),
    update: vi.fn(async () => makeSupplier()),
    ...overrides,
  };
}

function fakeProductRepository(overrides: Partial<IProductRepository> = {}): IProductRepository {
  return {
    list: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    getBySlug: vi.fn(async () => null),
    getById: vi.fn(async () => null),
    getManyByIds: vi.fn(async () => []),
    getManyBySlugs: vi.fn(async () => []),
    checkStock: vi.fn(async () => true),
    reserveStock: vi.fn(async (_items: StockReservationItem[]) => {}),
    releaseStock: vi.fn(async (_items: StockReservationItem[]) => {}),
    increaseStock: vi.fn(async (_items: StockReservationItem[]) => {}),
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

function buildService(deps: {
  supplies?: ISupplyRepository;
  suppliers?: ISupplierRepository;
  productRepo?: IProductRepository;
  events?: IMarketplaceEventBus;
}) {
  const inventory = new InventoryService(deps.productRepo ?? fakeProductRepository());
  return new SupplyService(
    deps.supplies ?? fakeSupplyRepo(),
    deps.suppliers ?? fakeSupplierRepo(),
    inventory,
    deps.events ?? fakeEventBus(),
  );
}

describe("SupplyService.createSupply", () => {
  it("throws SupplierNotFoundError when the supplier does not exist", async () => {
    const suppliers = fakeSupplierRepo({ getById: vi.fn(async () => null) });
    const service = buildService({ suppliers });

    await expect(
      service.createSupply({
        supplierId: "missing",
        items: [{ productId: "p1", quantity: 1, purchasePrice: 10 }],
      }),
    ).rejects.toBeInstanceOf(SupplierNotFoundError);
  });

  it("publishes supply.requested on success", async () => {
    const events = fakeEventBus();
    const supply = makeSupply();
    const supplies = fakeSupplyRepo({ create: vi.fn(async () => supply) });
    const service = buildService({ supplies, events });

    await service.createSupply({
      supplierId: "supplier-1",
      items: [{ productId: "p1", quantity: 1, purchasePrice: 10 }],
    });

    expect(events.publish).toHaveBeenCalledWith({ type: "supply.requested", supply });
  });
});

describe("SupplyService transitions", () => {
  it("sendSupply moves DRAFT -> SENT", async () => {
    const supplies = fakeSupplyRepo({
      getById: vi.fn(async () => makeSupply({ status: "DRAFT" })),
    });
    const service = buildService({ supplies });

    await service.sendSupply("supply-1");
    expect(supplies.updateStatus).toHaveBeenCalledWith("supply-1", "SENT");
  });

  it("sendSupply rejects a supply not in DRAFT", async () => {
    const supplies = fakeSupplyRepo({ getById: vi.fn(async () => makeSupply({ status: "SENT" })) });
    const service = buildService({ supplies });

    await expect(service.sendSupply("supply-1")).rejects.toBeInstanceOf(SupplyTransitionError);
    expect(supplies.updateStatus).not.toHaveBeenCalled();
  });

  it("confirmSupply moves SENT -> CONFIRMED", async () => {
    const supplies = fakeSupplyRepo({ getById: vi.fn(async () => makeSupply({ status: "SENT" })) });
    const service = buildService({ supplies });

    await service.confirmSupply("supply-1");
    expect(supplies.updateStatus).toHaveBeenCalledWith("supply-1", "CONFIRMED");
  });

  it("cancelSupply rejects an already-RECEIVED or CANCELLED supply", async () => {
    const supplies = fakeSupplyRepo({
      getById: vi.fn(async () => makeSupply({ status: "RECEIVED" })),
    });
    const service = buildService({ supplies });

    await expect(service.cancelSupply("supply-1")).rejects.toBeInstanceOf(SupplyTransitionError);
  });

  it("getSupply throws SupplyNotFoundError when missing", async () => {
    const supplies = fakeSupplyRepo({ getById: vi.fn(async () => null) });
    const service = buildService({ supplies });

    await expect(service.getSupply("missing")).rejects.toBeInstanceOf(SupplyNotFoundError);
  });
});

describe("SupplyService.receiveSupply", () => {
  it("increases stock for every item through InventoryService and publishes supply.received", async () => {
    const supply = makeSupply({
      status: "CONFIRMED",
      items: [
        { id: "i1", productId: "product-1", quantity: 10, purchasePrice: 50 },
        { id: "i2", productId: "product-2", quantity: 5, purchasePrice: 20 },
      ],
    });
    const supplies = fakeSupplyRepo({
      getById: vi.fn(async () => supply),
      updateStatus: vi.fn(async () => ({ ...supply, status: "RECEIVED" as const })),
    });
    const productRepo = fakeProductRepository();
    const events = fakeEventBus();
    const service = buildService({ supplies, productRepo, events });

    const result = await service.receiveSupply("supply-1");

    expect(productRepo.increaseStock).toHaveBeenCalledWith([
      { productId: "product-1", quantity: 10 },
      { productId: "product-2", quantity: 5 },
    ]);
    expect(result.status).toBe("RECEIVED");
    expect(events.publish).toHaveBeenCalledWith({
      type: "supply.received",
      supply: { ...supply, status: "RECEIVED" },
    });
  });

  it("rejects receiving an already-CANCELLED supply without touching stock", async () => {
    const supplies = fakeSupplyRepo({
      getById: vi.fn(async () => makeSupply({ status: "CANCELLED" })),
    });
    const productRepo = fakeProductRepository();
    const service = buildService({ supplies, productRepo });

    await expect(service.receiveSupply("supply-1")).rejects.toBeInstanceOf(SupplyTransitionError);
    expect(productRepo.increaseStock).not.toHaveBeenCalled();
  });
});
