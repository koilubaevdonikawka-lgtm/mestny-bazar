import { describe, expect, it, vi } from "vitest";
import { StockAdminService } from "@server/domain/stock-admin.service";
import { StockPolicyService } from "@server/domain/stock-policy/stock-policy.service";
import { LowStockThresholdRule } from "@server/domain/stock-policy/rules/low-stock-threshold.rule";
import { InventoryService } from "@server/domain/inventory.service";
import { StockValidationError } from "@server/domain/stock.errors";
import type { IStockRepository, StockRow } from "@server/ports/stock.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { ISupplierRepository } from "@server/ports/supplier.repository";
import type { IProductRepository, StockReservationItem } from "@server/ports/product.repository";
import type { SupplierDTO } from "@shared/contracts/supplier";

function makeRow(overrides: Partial<StockRow> = {}): StockRow {
  return {
    productId: "p1",
    name: "Молоко",
    stock: 10,
    lowStockThreshold: null,
    categoryId: null,
    unit: "л",
    ...overrides,
  };
}

function fakeStockRepo(overrides: Partial<IStockRepository> = {}): IStockRepository {
  return {
    list: vi.fn(async () => []),
    getById: vi.fn(async () => makeRow()),
    adjustStock: vi.fn(async () => makeRow()),
    setLowStockThreshold: vi.fn(async () => makeRow()),
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

function makeSupplier(overrides: Partial<SupplierDTO> = {}): SupplierDTO {
  return {
    id: "supplier-1",
    name: "Поставщик",
    contactPhone: null,
    contactPerson: null,
    notes: null,
    isActive: true,
    ...overrides,
  };
}

function fakeSuppliers(overrides: Partial<ISupplierRepository> = {}): ISupplierRepository {
  return {
    list: vi.fn(async () => []),
    getById: vi.fn(async () => makeSupplier()),
    create: vi.fn(async () => makeSupplier()),
    update: vi.fn(async () => makeSupplier()),
    ...overrides,
  };
}

function fakeProducts(overrides: Partial<IProductRepository> = {}): IProductRepository {
  return {
    list: vi.fn(),
    getBySlug: vi.fn(),
    getById: vi.fn(),
    getManyByIds: vi.fn(),
    getManyBySlugs: vi.fn(),
    checkStock: vi.fn(),
    reserveStock: vi.fn(),
    releaseStock: vi.fn(),
    increaseStock: vi.fn(async (_items: StockReservationItem[]) => {}),
    ...overrides,
  } as IProductRepository;
}

function buildService(
  deps: {
    stock?: IStockRepository;
    events?: IMarketplaceEventBus;
    suppliers?: ISupplierRepository;
    products?: IProductRepository;
  } = {},
) {
  const stockPolicy = new StockPolicyService([new LowStockThresholdRule()]);
  const inventory = new InventoryService(deps.products ?? fakeProducts());
  return new StockAdminService(
    deps.stock ?? fakeStockRepo(),
    stockPolicy,
    deps.events ?? fakeEventBus(),
    inventory,
    deps.suppliers ?? fakeSuppliers(),
  );
}

describe("StockAdminService.listStock", () => {
  it("maps rows to StockItemDTO with computed status", async () => {
    const stock = fakeStockRepo({
      list: vi.fn(async () => [makeRow({ stock: 10 }), makeRow({ productId: "p2", stock: 0 })]),
    });
    const service = buildService({ stock });

    const result = await service.listStock();
    expect(result).toEqual([
      expect.objectContaining({ productId: "p1", status: "ok" }),
      expect.objectContaining({ productId: "p2", status: "depleted" }),
    ]);
  });
});

describe("StockAdminService.adjustStock", () => {
  it("always publishes stock.adjusted (logs.md — Этап 5), regardless of resulting health", async () => {
    const stock = fakeStockRepo({ adjustStock: vi.fn(async () => makeRow({ stock: 50 })) });
    const events = fakeEventBus();
    const service = buildService({ stock, events });

    await service.adjustStock({ productId: "p1", stock: 50 });

    expect(events.publish).toHaveBeenCalledWith({
      type: "stock.adjusted",
      productId: "p1",
      stock: 50,
    });
  });

  it("publishes stock.low when the new stock falls at/below the threshold", async () => {
    const stock = fakeStockRepo({ adjustStock: vi.fn(async () => makeRow({ stock: 3 })) });
    const events = fakeEventBus();
    const service = buildService({ stock, events });

    const result = await service.adjustStock({ productId: "p1", stock: 3 });

    expect(result.status).toBe("low");
    expect(events.publish).toHaveBeenCalledWith({
      type: "stock.low",
      productId: "p1",
      stock: 3,
      threshold: 5,
    });
  });

  it("publishes stock.depleted when the new stock is zero", async () => {
    const stock = fakeStockRepo({ adjustStock: vi.fn(async () => makeRow({ stock: 0 })) });
    const events = fakeEventBus();
    const service = buildService({ stock, events });

    await service.adjustStock({ productId: "p1", stock: 0 });
    expect(events.publish).toHaveBeenCalledWith({ type: "stock.depleted", productId: "p1" });
  });

  it("publishes only stock.adjusted, not stock.low/stock.depleted, when the new stock is healthy", async () => {
    const stock = fakeStockRepo({ adjustStock: vi.fn(async () => makeRow({ stock: 50 })) });
    const events = fakeEventBus();
    const service = buildService({ stock, events });

    await service.adjustStock({ productId: "p1", stock: 50 });

    expect(events.publish).toHaveBeenCalledTimes(1);
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "stock.adjusted" }),
    );
  });
});

describe("StockAdminService.setThreshold", () => {
  it("delegates to the repository and re-evaluates status against the new threshold", async () => {
    const stock = fakeStockRepo({
      setLowStockThreshold: vi.fn(async () => makeRow({ stock: 8, lowStockThreshold: 10 })),
    });
    const events = fakeEventBus();
    const service = buildService({ stock, events });

    const result = await service.setThreshold({ productId: "p1", threshold: 10 });

    expect(stock.setLowStockThreshold).toHaveBeenCalledWith("p1", 10);
    expect(result).toMatchObject({ status: "low", effectiveThreshold: 10 });
    expect(events.publish).toHaveBeenCalledWith({
      type: "stock.low",
      productId: "p1",
      stock: 8,
      threshold: 10,
    });
  });
});

describe("StockAdminService.recordReceipt", () => {
  const validRequest = { productId: "p1", quantity: 5, movementDate: "2026-08-09" };

  it("rejects a non-positive quantity", async () => {
    const service = buildService();

    await expect(
      service.recordReceipt("user-1", { ...validRequest, quantity: 0 }),
    ).rejects.toBeInstanceOf(StockValidationError);
  });

  it("rejects a missing/invalid movement date", async () => {
    const service = buildService();

    await expect(
      service.recordReceipt("user-1", { ...validRequest, movementDate: "not-a-date" }),
    ).rejects.toBeInstanceOf(StockValidationError);
  });

  it("rejects a negative purchase price", async () => {
    const service = buildService();

    await expect(
      service.recordReceipt("user-1", { ...validRequest, purchasePrice: -1 }),
    ).rejects.toBeInstanceOf(StockValidationError);
  });

  it("rejects an unknown product", async () => {
    const stock = fakeStockRepo({ getById: vi.fn(async () => null) });
    const service = buildService({ stock });

    await expect(service.recordReceipt("user-1", validRequest)).rejects.toBeInstanceOf(
      StockValidationError,
    );
  });

  it("rejects an unknown supplier", async () => {
    const suppliers = fakeSuppliers({ getById: vi.fn(async () => null) });
    const service = buildService({ suppliers });

    await expect(
      service.recordReceipt("user-1", { ...validRequest, supplierId: "missing-supplier" }),
    ).rejects.toBeInstanceOf(StockValidationError);
  });

  it("increases stock through InventoryService.increaseStock and publishes stock.received with the actor", async () => {
    const increaseStock = vi.fn(async (_items: StockReservationItem[]) => {});
    const products = fakeProducts({ increaseStock });
    const events = fakeEventBus();
    const service = buildService({ events, products });

    await service.recordReceipt("user-1", {
      ...validRequest,
      purchasePrice: 100,
      supplierId: "supplier-1",
    });

    expect(increaseStock).toHaveBeenCalledWith([{ productId: "p1", quantity: 5 }]);
    expect(events.publish).toHaveBeenCalledWith({
      type: "stock.received",
      productId: "p1",
      quantity: 5,
      actorId: "user-1",
      movementDate: "2026-08-09",
      purchasePrice: 100,
      supplierId: "supplier-1",
    });
  });

  it("does not require a supplier or purchase price", async () => {
    const events = fakeEventBus();
    const service = buildService({ events });

    await service.recordReceipt("user-1", validRequest);

    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ purchasePrice: null, supplierId: null }),
    );
  });
});

describe("StockAdminService.recordReturn", () => {
  const validRequest = { productId: "p1", quantity: 2, movementDate: "2026-08-09" };

  it("rejects a non-positive quantity", async () => {
    const service = buildService();

    await expect(
      service.recordReturn("user-1", { ...validRequest, quantity: -1 }),
    ).rejects.toBeInstanceOf(StockValidationError);
  });

  it("rejects an unknown product", async () => {
    const stock = fakeStockRepo({ getById: vi.fn(async () => null) });
    const service = buildService({ stock });

    await expect(service.recordReturn("user-1", validRequest)).rejects.toBeInstanceOf(
      StockValidationError,
    );
  });

  it("increases stock through InventoryService.increaseStock and publishes stock.returned with the actor", async () => {
    const increaseStock = vi.fn(async (_items: StockReservationItem[]) => {});
    const products = fakeProducts({ increaseStock });
    const events = fakeEventBus();
    const service = buildService({ events, products });

    await service.recordReturn("user-1", { ...validRequest, note: "Возврат по заказу №42" });

    expect(increaseStock).toHaveBeenCalledWith([{ productId: "p1", quantity: 2 }]);
    expect(events.publish).toHaveBeenCalledWith({
      type: "stock.returned",
      productId: "p1",
      quantity: 2,
      actorId: "user-1",
      movementDate: "2026-08-09",
      note: "Возврат по заказу №42",
    });
  });
});
