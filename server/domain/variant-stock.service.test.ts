import { describe, expect, it, vi } from "vitest";
import { VariantStockService } from "@server/domain/variant-stock.service";
import {
  VariantStockAlreadyExistsError,
  VariantStockNotFoundError,
  VariantStockValidationError,
} from "@server/domain/variant-stock.errors";
import type {
  IVariantStockRepository,
  VariantStockRow,
} from "@server/ports/variant-stock.repository";
import type { IProductVariantRepository } from "@server/ports/product-variant.repository";
import type { IStockPolicy, StockPolicyResult } from "@server/ports/stock-policy.port";
import type { ProductVariantDTO } from "@shared/contracts/product-variant";

function makeVariant(overrides: Partial<ProductVariantDTO> = {}): ProductVariantDTO {
  return {
    id: "var-1",
    productId: "prod-1",
    sku: "SKU-1",
    price: null,
    imageUrl: null,
    publicationStatus: "DRAFT",
    sortOrder: 0,
    ...overrides,
  };
}

function makeRow(overrides: Partial<VariantStockRow> = {}): VariantStockRow {
  return { variantId: "var-1", stock: 10, lowStockThreshold: null, ...overrides };
}

function fakeVariantStockRepo(
  overrides: Partial<IVariantStockRepository> = {},
): IVariantStockRepository {
  return {
    listForProduct: vi.fn(async () => []),
    getByVariantId: vi.fn(async () => null),
    create: vi.fn(async () => makeRow()),
    adjustStock: vi.fn(async () => makeRow()),
    setLowStockThreshold: vi.fn(async () => makeRow()),
    reserveStock: vi.fn(async () => {}),
    releaseStock: vi.fn(async () => {}),
    ...overrides,
  };
}

function fakeVariantRepo(
  overrides: Partial<IProductVariantRepository> = {},
): IProductVariantRepository {
  return {
    listForProduct: vi.fn(async () => []),
    getById: vi.fn(async () => makeVariant()),
    create: vi.fn(async () => makeVariant()),
    update: vi.fn(async () => makeVariant()),
    skuExists: vi.fn(async () => false),
    ...overrides,
  };
}

function fakeStockPolicy(result?: Partial<StockPolicyResult>): IStockPolicy {
  const evaluateStock = vi.fn((): StockPolicyResult => ({
    allowed: true,
    effectiveThreshold: 5,
    ...result,
  }));
  return { evaluateStock, assertStockOk: vi.fn() };
}

describe("VariantStockService.initializeStock", () => {
  it("rejects an unknown variantId", async () => {
    const variants = fakeVariantRepo({ getById: vi.fn(async () => null) });
    const service = new VariantStockService(fakeVariantStockRepo(), variants, fakeStockPolicy());

    await expect(service.initializeStock({ variantId: "missing" })).rejects.toBeInstanceOf(
      VariantStockValidationError,
    );
  });

  it("rejects re-initializing an already-tracked variant", async () => {
    const variantStock = fakeVariantStockRepo({ getByVariantId: vi.fn(async () => makeRow()) });
    const service = new VariantStockService(variantStock, fakeVariantRepo(), fakeStockPolicy());

    await expect(service.initializeStock({ variantId: "var-1" })).rejects.toBeInstanceOf(
      VariantStockAlreadyExistsError,
    );
    expect(variantStock.create).not.toHaveBeenCalled();
  });

  it("rejects a negative initial stock", async () => {
    const service = new VariantStockService(
      fakeVariantStockRepo(),
      fakeVariantRepo(),
      fakeStockPolicy(),
    );

    await expect(service.initializeStock({ variantId: "var-1", stock: -1 })).rejects.toBeInstanceOf(
      VariantStockValidationError,
    );
  });

  it("defaults stock to 0 when omitted", async () => {
    const variantStock = fakeVariantStockRepo();
    const service = new VariantStockService(variantStock, fakeVariantRepo(), fakeStockPolicy());

    await service.initializeStock({ variantId: "var-1" });
    expect(variantStock.create).toHaveBeenCalledWith("var-1", 0, null);
  });

  it("initializes successfully with an explicit stock and threshold", async () => {
    const variantStock = fakeVariantStockRepo();
    const service = new VariantStockService(variantStock, fakeVariantRepo(), fakeStockPolicy());

    await service.initializeStock({ variantId: "var-1", stock: 25, lowStockThreshold: 5 });
    expect(variantStock.create).toHaveBeenCalledWith("var-1", 25, 5);
  });
});

describe("VariantStockService.adjustStock", () => {
  it("throws VariantStockNotFoundError when stock is not yet tracked", async () => {
    const variantStock = fakeVariantStockRepo({ getByVariantId: vi.fn(async () => null) });
    const service = new VariantStockService(variantStock, fakeVariantRepo(), fakeStockPolicy());

    await expect(service.adjustStock({ variantId: "var-1", stock: 5 })).rejects.toBeInstanceOf(
      VariantStockNotFoundError,
    );
    expect(variantStock.adjustStock).not.toHaveBeenCalled();
  });

  it("rejects a non-integer stock", async () => {
    const variantStock = fakeVariantStockRepo({ getByVariantId: vi.fn(async () => makeRow()) });
    const service = new VariantStockService(variantStock, fakeVariantRepo(), fakeStockPolicy());

    await expect(service.adjustStock({ variantId: "var-1", stock: 1.5 })).rejects.toBeInstanceOf(
      VariantStockValidationError,
    );
  });

  it("adjusts successfully and reports status via IStockPolicy", async () => {
    const variantStock = fakeVariantStockRepo({
      getByVariantId: vi.fn(async () => makeRow()),
      adjustStock: vi.fn(async () => makeRow({ stock: 2 })),
    });
    const stockPolicy = fakeStockPolicy({ allowed: false, denialCode: "LOW_STOCK" });
    const service = new VariantStockService(variantStock, fakeVariantRepo(), stockPolicy);

    const result = await service.adjustStock({ variantId: "var-1", stock: 2 });
    expect(variantStock.adjustStock).toHaveBeenCalledWith("var-1", 2);
    expect(result.status).toBe("low");
  });

  it("reports depleted status when the policy denies with DEPLETED", async () => {
    const variantStock = fakeVariantStockRepo({
      getByVariantId: vi.fn(async () => makeRow()),
      adjustStock: vi.fn(async () => makeRow({ stock: 0 })),
    });
    const stockPolicy = fakeStockPolicy({ allowed: false, denialCode: "DEPLETED" });
    const service = new VariantStockService(variantStock, fakeVariantRepo(), stockPolicy);

    const result = await service.adjustStock({ variantId: "var-1", stock: 0 });
    expect(result.status).toBe("depleted");
  });
});

describe("VariantStockService.setThreshold", () => {
  it("throws VariantStockNotFoundError when stock is not yet tracked", async () => {
    const variantStock = fakeVariantStockRepo({ getByVariantId: vi.fn(async () => null) });
    const service = new VariantStockService(variantStock, fakeVariantRepo(), fakeStockPolicy());

    await expect(service.setThreshold({ variantId: "var-1", threshold: 5 })).rejects.toBeInstanceOf(
      VariantStockNotFoundError,
    );
    expect(variantStock.setLowStockThreshold).not.toHaveBeenCalled();
  });

  it("allows clearing the threshold with null", async () => {
    const variantStock = fakeVariantStockRepo({ getByVariantId: vi.fn(async () => makeRow()) });
    const service = new VariantStockService(variantStock, fakeVariantRepo(), fakeStockPolicy());

    await service.setThreshold({ variantId: "var-1", threshold: null });
    expect(variantStock.setLowStockThreshold).toHaveBeenCalledWith("var-1", null);
  });
});

describe("VariantStockService.getByVariantId / listForProduct", () => {
  it("returns null when stock is not tracked", async () => {
    const service = new VariantStockService(
      fakeVariantStockRepo({ getByVariantId: vi.fn(async () => null) }),
      fakeVariantRepo(),
      fakeStockPolicy(),
    );

    expect(await service.getByVariantId("var-1")).toBeNull();
  });

  it("computes status for every row when listing by product", async () => {
    const variantStock = fakeVariantStockRepo({
      listForProduct: vi.fn(async () => [
        makeRow({ variantId: "var-1", stock: 10 }),
        makeRow({ variantId: "var-2", stock: 0 }),
      ]),
    });
    const service = new VariantStockService(variantStock, fakeVariantRepo(), fakeStockPolicy());

    const result = await service.listForProduct("prod-1");
    expect(result).toHaveLength(2);
    expect(result[0].variantId).toBe("var-1");
    expect(result[1].variantId).toBe("var-2");
  });
});

describe("VariantStockService.reserveStock / releaseStock (Stage 19)", () => {
  it("delegates reserveStock to the repository unmodified — mirrors InventoryService.reserveStock", async () => {
    const variantStock = fakeVariantStockRepo();
    const service = new VariantStockService(variantStock, fakeVariantRepo(), fakeStockPolicy());
    const items = [{ variantId: "var-1", quantity: 2 }];

    await service.reserveStock(items);
    expect(variantStock.reserveStock).toHaveBeenCalledWith(items);
  });

  it("propagates a reservation failure (e.g. InsufficientVariantStockError) as-is", async () => {
    const error = new Error("INSUFFICIENT_VARIANT_STOCK:var-1");
    const variantStock = fakeVariantStockRepo({
      reserveStock: vi.fn(async () => {
        throw error;
      }),
    });
    const service = new VariantStockService(variantStock, fakeVariantRepo(), fakeStockPolicy());

    await expect(service.reserveStock([{ variantId: "var-1", quantity: 5 }])).rejects.toBe(error);
  });

  it("delegates releaseStock to the repository unmodified — mirrors InventoryService.releaseStock", async () => {
    const variantStock = fakeVariantStockRepo();
    const service = new VariantStockService(variantStock, fakeVariantRepo(), fakeStockPolicy());
    const items = [{ variantId: "var-1", quantity: 2 }];

    await service.releaseStock(items);
    expect(variantStock.releaseStock).toHaveBeenCalledWith(items);
  });
});
