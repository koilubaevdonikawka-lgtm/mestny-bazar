import { describe, expect, it, vi } from "vitest";
import { CartService } from "@server/domain/cart.service";
import type { CartLineUpsertInput, ICartRepository } from "@server/ports/cart.repository";
import type { IProductRepository } from "@server/ports/product.repository";
import type { CartDTO, CartLineInput } from "@shared/contracts/cart";
import type { ProductDTO } from "@shared/contracts/catalog";

function makeProduct(overrides: Partial<ProductDTO> = {}): ProductDTO {
  return {
    id: "prod-1",
    name: "Молоко",
    slug: "moloko",
    description: null,
    price: 100,
    currency: "KGS",
    unit: null,
    imageUrl: null,
    stock: 10,
    inStock: true,
    categoryId: null,
    ...overrides,
  };
}

function makeLine(overrides: Partial<CartLineInput> = {}): CartLineInput {
  return {
    productId: "prod-1",
    quantity: 1,
    snapshot: { name: "Молоко", price: 100, currency: "KGS", imageUrl: null },
    ...overrides,
  };
}

function emptyCart(): CartDTO {
  return { items: [], updatedAt: null };
}

function fakeProductRepository(overrides: Partial<IProductRepository> = {}): IProductRepository {
  return {
    list: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 20, hasMore: false })),
    getBySlug: vi.fn(async () => null),
    getById: vi.fn(async () => null),
    getManyByIds: vi.fn(async () => []),
    getManyBySlugs: vi.fn(async () => []),
    checkStock: vi.fn(async () => true),
    reserveStock: vi.fn(async () => {}),
    releaseStock: vi.fn(async () => {}),
    increaseStock: vi.fn(async () => {}),
    ...overrides,
  };
}

function fakeCartRepository(overrides: Partial<ICartRepository> = {}): ICartRepository {
  return {
    getByUserId: vi.fn(async () => emptyCart()),
    upsertItems: vi.fn(async () => emptyCart()),
    updateQuantity: vi.fn(async () => emptyCart()),
    removeItem: vi.fn(async () => emptyCart()),
    clear: vi.fn(async () => {}),
    ...overrides,
  };
}

describe("CartService.validate", () => {
  it("resolves a line by productId", async () => {
    const products = fakeProductRepository({ getManyByIds: vi.fn(async () => [makeProduct()]) });
    const service = new CartService(products, fakeCartRepository());

    const result = await service.validate([makeLine()]);
    expect(result.lines[0].status).toBe("ok");
    expect(result.hasChanges).toBe(false);
  });

  it("resolves a line by productSlug when no productId is given", async () => {
    const products = fakeProductRepository({ getManyBySlugs: vi.fn(async () => [makeProduct()]) });
    const service = new CartService(products, fakeCartRepository());

    const result = await service.validate([
      makeLine({ productId: undefined, productSlug: "moloko" }),
    ]);
    expect(result.lines[0].status).toBe("ok");
  });

  it("reports not_found when the product doesn't exist in IProductRepository", async () => {
    const products = fakeProductRepository({ getManyByIds: vi.fn(async () => []) });
    const service = new CartService(products, fakeCartRepository());

    const result = await service.validate([makeLine()]);
    expect(result.lines[0].status).toBe("not_found");
    expect(result.lines[0].product).toBeNull();
    expect(result.hasChanges).toBe(true);
  });

  it("reports out_of_stock when requested quantity exceeds current stock", async () => {
    const products = fakeProductRepository({
      getManyByIds: vi.fn(async () => [makeProduct({ stock: 1 })]),
    });
    const service = new CartService(products, fakeCartRepository());

    const result = await service.validate([makeLine({ quantity: 5 })]);
    expect(result.lines[0].status).toBe("out_of_stock");
  });

  it("reports out_of_stock when the product is marked not in stock, regardless of stock count", async () => {
    const products = fakeProductRepository({
      getManyByIds: vi.fn(async () => [makeProduct({ inStock: false, stock: 100 })]),
    });
    const service = new CartService(products, fakeCartRepository());

    const result = await service.validate([makeLine({ quantity: 1 })]);
    expect(result.lines[0].status).toBe("out_of_stock");
  });

  it("reports price_changed when the authoritative price differs from the client snapshot", async () => {
    const products = fakeProductRepository({
      getManyByIds: vi.fn(async () => [makeProduct({ price: 150 })]),
    });
    const service = new CartService(products, fakeCartRepository());

    const result = await service.validate([makeLine({ snapshot: { name: "Молоко", price: 100 } })]);
    expect(result.lines[0].status).toBe("price_changed");
    expect(result.lines[0].product?.price).toBe(150);
  });

  it("never trusts the client snapshot price — the returned product price is always IProductRepository's", async () => {
    const products = fakeProductRepository({
      getManyByIds: vi.fn(async () => [makeProduct({ price: 999 })]),
    });
    const service = new CartService(products, fakeCartRepository());

    const result = await service.validate([makeLine({ snapshot: { name: "x", price: 1 } })]);
    expect(result.lines[0].product?.price).toBe(999);
  });
});

describe("CartService server-cart delegation", () => {
  it("getCart delegates to the repository", async () => {
    const carts = fakeCartRepository();
    const service = new CartService(fakeProductRepository(), carts);

    await service.getCart("user-1");
    expect(carts.getByUserId).toHaveBeenCalledWith("user-1");
  });

  it("addItem maps the snapshot into an upsert input", async () => {
    const carts = fakeCartRepository();
    const service = new CartService(fakeProductRepository(), carts);

    await service.addItem("user-1", makeLine({ quantity: 3 }));
    expect(carts.upsertItems).toHaveBeenCalledWith("user-1", [
      {
        productId: "prod-1",
        productSlug: undefined,
        quantity: 3,
        name: "Молоко",
        price: 100,
        currency: "KGS",
        imageUrl: null,
      },
    ]);
  });

  it("updateQuantity with quantity <= 0 removes the line instead of setting it", async () => {
    const carts = fakeCartRepository();
    const service = new CartService(fakeProductRepository(), carts);

    await service.updateQuantity("user-1", { productId: "prod-1" }, 0);
    expect(carts.removeItem).toHaveBeenCalledWith("user-1", { productId: "prod-1" });
    expect(carts.updateQuantity).not.toHaveBeenCalled();
  });

  it("updateQuantity with a positive quantity sets it via the repository", async () => {
    const carts = fakeCartRepository();
    const service = new CartService(fakeProductRepository(), carts);

    await service.updateQuantity("user-1", { productId: "prod-1" }, 5);
    expect(carts.updateQuantity).toHaveBeenCalledWith("user-1", { productId: "prod-1" }, 5);
  });

  it("mergeGuestItems upserts every guest line in one batch", async () => {
    const carts = fakeCartRepository();
    const service = new CartService(fakeProductRepository(), carts);
    const lines = [makeLine({ productId: "prod-1" }), makeLine({ productId: "prod-2" })];

    await service.mergeGuestItems("user-1", lines);
    const call = (carts.upsertItems as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      CartLineUpsertInput[],
    ];
    expect(call[0]).toBe("user-1");
    expect(call[1]).toHaveLength(2);
  });

  it("mergeGuestItems with no lines just returns the existing server cart, without upserting", async () => {
    const carts = fakeCartRepository();
    const service = new CartService(fakeProductRepository(), carts);

    await service.mergeGuestItems("user-1", []);
    expect(carts.getByUserId).toHaveBeenCalledWith("user-1");
    expect(carts.upsertItems).not.toHaveBeenCalled();
  });
});
