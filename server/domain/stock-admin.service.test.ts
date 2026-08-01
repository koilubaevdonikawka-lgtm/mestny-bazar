import { describe, expect, it, vi } from "vitest";
import { StockAdminService } from "@server/domain/stock-admin.service";
import { StockPolicyService } from "@server/domain/stock-policy/stock-policy.service";
import { LowStockThresholdRule } from "@server/domain/stock-policy/rules/low-stock-threshold.rule";
import type { IStockRepository, StockRow } from "@server/ports/stock.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";

function makeRow(overrides: Partial<StockRow> = {}): StockRow {
  return {
    productId: "p1",
    name: "Молоко",
    stock: 10,
    lowStockThreshold: null,
    categoryId: null,
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

function buildService(deps: { stock?: IStockRepository; events?: IMarketplaceEventBus } = {}) {
  const stockPolicy = new StockPolicyService([new LowStockThresholdRule()]);
  return new StockAdminService(
    deps.stock ?? fakeStockRepo(),
    stockPolicy,
    deps.events ?? fakeEventBus(),
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

  it("does not publish anything when the new stock is healthy", async () => {
    const stock = fakeStockRepo({ adjustStock: vi.fn(async () => makeRow({ stock: 50 })) });
    const events = fakeEventBus();
    const service = buildService({ stock, events });

    await service.adjustStock({ productId: "p1", stock: 50 });
    expect(events.publish).not.toHaveBeenCalled();
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
