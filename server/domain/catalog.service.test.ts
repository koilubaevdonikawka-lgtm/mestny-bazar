import { describe, expect, it, vi } from "vitest";
import { CatalogService } from "@server/domain/catalog.service";
import type { IProductRepository } from "@server/ports/product.repository";
import type { ICategoryRepository } from "@server/ports/category.repository";
import type { CategoryDTO, ProductListResult } from "@shared/contracts/catalog";

function fakeProductRepo(overrides: Partial<IProductRepository> = {}): IProductRepository {
  return {
    list: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
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

function fakeCategoryRepo(overrides: Partial<ICategoryRepository> = {}): ICategoryRepository {
  return {
    list: vi.fn(async () => []),
    getBySlug: vi.fn(async () => null),
    ...overrides,
  };
}

const CATEGORY: CategoryDTO = {
  id: "cat-1",
  name: "Мука и крупы",
  slug: "muka-krupy",
  description: null,
  imageUrl: null,
  sortOrder: 1,
  nameKg: null,
  parentId: null,
};

describe("CatalogService.listProducts", () => {
  it("delegates straight to the product repository when no categorySlug is given", async () => {
    const products = fakeProductRepo();
    const categories = fakeCategoryRepo();
    const service = new CatalogService(products, categories);

    await service.listProducts({ search: "молоко" });

    expect(categories.getBySlug).not.toHaveBeenCalled();
    expect(products.list).toHaveBeenCalledWith({ search: "молоко" });
  });

  it("resolves categorySlug to categoryId via the category repository before listing products", async () => {
    const listResult: ProductListResult = {
      items: [],
      total: 3,
      page: 1,
      pageSize: 50,
      hasMore: false,
    };
    const products = fakeProductRepo({ list: vi.fn(async () => listResult) });
    const categories = fakeCategoryRepo({ getBySlug: vi.fn(async () => CATEGORY) });
    const service = new CatalogService(products, categories);

    const result = await service.listProducts({ categorySlug: "muka-krupy", page: 1 });

    expect(categories.getBySlug).toHaveBeenCalledWith("muka-krupy");
    expect(products.list).toHaveBeenCalledWith({
      categorySlug: "muka-krupy",
      page: 1,
      categoryId: "cat-1",
    });
    expect(result).toBe(listResult);
  });

  it("returns an empty page and never queries products when the category slug is unknown", async () => {
    const products = fakeProductRepo();
    const categories = fakeCategoryRepo({ getBySlug: vi.fn(async () => null) });
    const service = new CatalogService(products, categories);

    const result = await service.listProducts({ categorySlug: "does-not-exist", pageSize: 24 });

    expect(products.list).not.toHaveBeenCalled();
    expect(result).toEqual({ items: [], total: 0, page: 1, pageSize: 24, hasMore: false });
  });
});

describe("CatalogService.getProductBySlug", () => {
  it("delegates to the product repository", async () => {
    const products = fakeProductRepo();
    const categories = fakeCategoryRepo();
    const service = new CatalogService(products, categories);

    await service.getProductBySlug("some-product");

    expect(products.getBySlug).toHaveBeenCalledWith("some-product");
  });
});
