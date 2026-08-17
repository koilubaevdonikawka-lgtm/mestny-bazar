import { describe, expect, it, vi } from "vitest";
import { SellerProductService } from "@server/domain/seller-product.service";
import {
  SellerProductNotFoundError,
  SellerProductValidationError,
} from "@server/domain/seller-product.errors";
import type { ISellerProductRepository } from "@server/ports/seller-product.repository";
import type { IProductPublicationPolicy } from "@server/ports/product-publication.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import type { SellerProductDTO } from "@shared/contracts/seller-product";
import type { AdminCategoryDTO } from "@shared/contracts/category-admin";

function makeProduct(overrides: Partial<SellerProductDTO> = {}): SellerProductDTO {
  return {
    id: "product-1",
    name: "Test Product",
    slug: "test-product",
    description: null,
    price: 100,
    currency: "KGS",
    unit: null,
    imageUrl: null,
    imageUrls: [],
    manufacturer: null,
    countryOfOrigin: null,
    sku: null,
    stock: 5,
    publicationStatus: "DRAFT",
    categoryId: null,
    ...overrides,
  };
}

function makeCategory(overrides: Partial<AdminCategoryDTO> = {}): AdminCategoryDTO {
  return {
    id: "cat-1",
    name: "Dairy",
    slug: "dairy",
    description: null,
    imageUrl: null,
    sortOrder: 0,
    isActive: true,
    nameKg: null,
    parentId: null,
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<ISellerProductRepository> = {}): ISellerProductRepository {
  return {
    listBySeller: vi.fn(async () => []),
    listAll: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    getById: vi.fn(async () => null),
    create: vi.fn(async (_sellerId, data) => makeProduct({ ...data, slug: data.slug! })),
    update: vi.fn(async () => makeProduct()),
    setPublicationStatus: vi.fn(async (_sellerId, _id, status) =>
      makeProduct({ publicationStatus: status }),
    ),
    delete: vi.fn(async () => {}),
    slugExists: vi.fn(async () => false),
    ...overrides,
  };
}

function fakeCategories(
  overrides: Partial<IAdminCategoryRepository> = {},
): IAdminCategoryRepository {
  return {
    listAll: vi.fn(async () => []),
    getById: vi.fn(async () => makeCategory()),
    create: vi.fn(async () => makeCategory()),
    update: vi.fn(async () => makeCategory()),
    delete: vi.fn(async () => {}),
    slugExists: vi.fn(async () => false),
    ...overrides,
  };
}

function fakePolicy(overrides: Partial<IProductPublicationPolicy> = {}): IProductPublicationPolicy {
  return {
    canTransition: vi.fn(() => ({ allowed: true })),
    assertCanTransition: vi.fn(() => {}),
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

describe("SellerProductService.listProducts / getProduct", () => {
  it("listProducts delegates to the repository for the given seller", async () => {
    const repo = fakeRepo({ listBySeller: vi.fn(async () => [makeProduct()]) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    const result = await service.listProducts("seller-1");

    expect(repo.listBySeller).toHaveBeenCalledWith("seller-1");
    expect(result).toEqual([makeProduct()]);
  });

  it("getProduct returns the product when it exists", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    const result = await service.getProduct("product-1", "seller-1");

    expect(repo.getById).toHaveBeenCalledWith("product-1", "seller-1");
    expect(result).toEqual(makeProduct());
  });

  it("getProduct throws SellerProductNotFoundError when the repository returns null", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await expect(service.getProduct("missing", "seller-1")).rejects.toBeInstanceOf(
      SellerProductNotFoundError,
    );
  });
});

describe("SellerProductService.listAllProducts / getProductAsAdmin", () => {
  it("listAllProducts delegates to the repository's paginated listAll", async () => {
    const page = { items: [makeProduct()], total: 1, page: 1, pageSize: 50, hasMore: false };
    const repo = fakeRepo({ listAll: vi.fn(async () => page) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    const result = await service.listAllProducts({ page: 1, pageSize: 50 });

    expect(repo.listAll).toHaveBeenCalledWith({ page: 1, pageSize: 50 });
    expect(result).toBe(page);
  });

  it("getProductAsAdmin reads with sellerId: null (no ownership scoping)", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await service.getProductAsAdmin("product-1");

    expect(repo.getById).toHaveBeenCalledWith("product-1", null);
  });

  it("getProductAsAdmin throws SellerProductNotFoundError when missing", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await expect(service.getProductAsAdmin("missing")).rejects.toBeInstanceOf(
      SellerProductNotFoundError,
    );
  });
});

describe("SellerProductService.createProduct", () => {
  it("rejects a name shorter than 2 characters", async () => {
    const repo = fakeRepo();
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await expect(
      service.createProduct("seller-1", { name: "A", price: 10 }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("rejects a negative price", async () => {
    const repo = fakeRepo();
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await expect(
      service.createProduct("seller-1", { name: "Valid Name", price: -1 }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
  });

  it("rejects a non-integer stock", async () => {
    const repo = fakeRepo();
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await expect(
      service.createProduct("seller-1", { name: "Valid Name", price: 10, stock: 1.5 }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
  });

  it("falls back to a timestamp-based slug for a name that strips to nothing", async () => {
    const repo = fakeRepo();
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    // Cyrillic characters are not in slugify's [a-z0-9\s-] allowlist, so a
    // Cyrillic-only name strips down to nothing rather than a usable slug.
    await service.createProduct("seller-1", { name: "Свежий Хлеб!!", price: 10 });
    const [, payload] = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload.slug).toMatch(/^product-\d+$/);
  });

  it("falls back to an ASCII-only slug for a Latin name", async () => {
    const repo = fakeRepo();
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await service.createProduct("seller-1", { name: "Fresh Bread!!", price: 10 });
    const [, payload] = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload.slug).toBe("fresh-bread");
  });

  it("appends a numeric suffix when the slug is already taken", async () => {
    const repo = fakeRepo({
      slugExists: vi.fn(async (slug: string) => slug === "fresh-bread"),
    });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await service.createProduct("seller-1", { name: "Fresh Bread", price: 10 });
    const [, payload] = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload.slug).toBe("fresh-bread-2");
  });

  it("falls back to a timestamp-suffixed slug once all 19 numeric suffixes (2-20) are also taken", async () => {
    const repo = fakeRepo({ slugExists: vi.fn(async () => true) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await service.createProduct("seller-1", { name: "Fresh Bread", price: 10 });
    const [, payload] = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload.slug).toMatch(/^fresh-bread-\d+$/);
    expect(payload.slug).not.toBe("fresh-bread-2");
  });

  it("checks the publication policy allows seller_create before creating", async () => {
    const policy = fakePolicy({
      assertCanTransition: vi.fn(() => {
        throw new Error("denied");
      }),
    });
    const repo = fakeRepo();
    const service = new SellerProductService(repo, fakeCategories(), policy, fakeEventBus());

    await expect(
      service.createProduct("seller-1", { name: "Fresh Bread", price: 10 }),
    ).rejects.toThrow("denied");
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("rejects creation when categoryId does not exist", async () => {
    const repo = fakeRepo();
    const categories = fakeCategories({ getById: vi.fn(async () => null) });
    const service = new SellerProductService(repo, categories, fakePolicy(), fakeEventBus());

    await expect(
      service.createProduct("seller-1", { name: "Fresh Bread", price: 10, categoryId: "cat-1" }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("allows creation when categoryId exists", async () => {
    const repo = fakeRepo();
    const categories = fakeCategories({ getById: vi.fn(async () => makeCategory()) });
    const service = new SellerProductService(repo, categories, fakePolicy(), fakeEventBus());

    await service.createProduct("seller-1", {
      name: "Fresh Bread",
      price: 10,
      categoryId: "cat-1",
    });
    expect(categories.getById).toHaveBeenCalledWith("cat-1");
    expect(repo.create).toHaveBeenCalled();
  });

  it("a seller is always bootstrapped into DRAFT via reason seller_create, ignoring any publicationStatus sent", async () => {
    const repo = fakeRepo();
    const policy = fakePolicy();
    const service = new SellerProductService(repo, fakeCategories(), policy, fakeEventBus());

    await service.createProduct("seller-1", {
      name: "Fresh Bread",
      price: 10,
      publicationStatus: "PUBLISHED",
    });

    expect(policy.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "seller_create", targetStatus: "DRAFT" }),
    );
    const [, payload] = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload.publicationStatus).toBe("DRAFT");
  });

  it("an admin (sellerId: null) may request PUBLISHED directly, checked via reason admin_create", async () => {
    const repo = fakeRepo({
      create: vi.fn(async () => makeProduct({ publicationStatus: "PUBLISHED" })),
    });
    const policy = fakePolicy();
    const events = fakeEventBus();
    const service = new SellerProductService(repo, fakeCategories(), policy, events);

    await service.createProduct(null, {
      name: "Fresh Bread",
      price: 10,
      categoryId: "cat-1",
      publicationStatus: "PUBLISHED",
    });

    expect(repo.create).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ categoryId: "cat-1" }),
    );
    expect(policy.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "admin_create", targetStatus: "PUBLISHED" }),
    );
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "product.published" }),
    );
  });
});

describe("SellerProductService.updateProduct", () => {
  it("throws SellerProductNotFoundError for a product the seller does not own", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await expect(
      service.updateProduct("seller-1", { id: "product-1", price: 20 }),
    ).rejects.toBeInstanceOf(SellerProductNotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("validates price when it is being changed", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await expect(
      service.updateProduct("seller-1", { id: "product-1", price: -5 }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("validates name when it is being changed", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await expect(
      service.updateProduct("seller-1", { id: "product-1", name: "A" }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("validates stock when it is being changed", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await expect(
      service.updateProduct("seller-1", { id: "product-1", stock: -1 }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("rejects an update that moves the product to a categoryId that does not exist", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const categories = fakeCategories({ getById: vi.fn(async () => null) });
    const service = new SellerProductService(repo, categories, fakePolicy(), fakeEventBus());

    await expect(
      service.updateProduct("seller-1", { id: "product-1", categoryId: "missing-cat" }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("leaves unspecified fields unvalidated and applies the patch when nothing changed is invalid", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await service.updateProduct("seller-1", { id: "product-1", description: "New description" });

    expect(repo.update).toHaveBeenCalledWith(
      "seller-1",
      expect.objectContaining({ id: "product-1", description: "New description" }),
    );
  });

  it("resolves a fresh unique slug when the slug is being changed", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await service.updateProduct("seller-1", { id: "product-1", slug: "new-slug" });

    expect(repo.slugExists).toHaveBeenCalledWith("new-slug", "product-1");
    expect(repo.update).toHaveBeenCalledWith(
      "seller-1",
      expect.objectContaining({ slug: "new-slug" }),
    );
  });

  it("rejects a blank slug on update", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await expect(
      service.updateProduct("seller-1", { id: "product-1", slug: "   " }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("strips publicationStatus from a seller's update patch even if sent", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const policy = fakePolicy();
    const service = new SellerProductService(repo, fakeCategories(), policy, fakeEventBus());

    await service.updateProduct("seller-1", { id: "product-1", publicationStatus: "PUBLISHED" });

    expect(policy.assertCanTransition).not.toHaveBeenCalled();
    const [, patch] = (repo.update as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(patch.publicationStatus).toBeUndefined();
  });

  it("an admin (sellerId: null) changing publicationStatus is checked via reason admin_update and publishes product.published", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeProduct({ publicationStatus: "DRAFT" })),
      update: vi.fn(async () => makeProduct({ publicationStatus: "PUBLISHED" })),
    });
    const policy = fakePolicy();
    const events = fakeEventBus();
    const service = new SellerProductService(repo, fakeCategories(), policy, events);

    await service.updateProduct(null, { id: "product-1", publicationStatus: "PUBLISHED" });

    expect(repo.getById).toHaveBeenCalledWith("product-1", null);
    expect(policy.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: "admin_update",
        currentStatus: "DRAFT",
        targetStatus: "PUBLISHED",
      }),
    );
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "product.published" }),
    );
  });

  it("an admin update that does not change publicationStatus never touches the publication policy", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeProduct({ publicationStatus: "DRAFT" })),
    });
    const policy = fakePolicy();
    const service = new SellerProductService(repo, fakeCategories(), policy, fakeEventBus());

    await service.updateProduct(null, { id: "product-1", price: 150 });

    expect(policy.assertCanTransition).not.toHaveBeenCalled();
  });

  it("an admin can hide a published product (publicationStatus: HIDDEN) without publishing product.published", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeProduct({ publicationStatus: "PUBLISHED" })),
      update: vi.fn(async () => makeProduct({ publicationStatus: "HIDDEN" })),
    });
    const policy = fakePolicy();
    const events = fakeEventBus();
    const service = new SellerProductService(repo, fakeCategories(), policy, events);

    const result = await service.updateProduct(null, {
      id: "product-1",
      publicationStatus: "HIDDEN",
    });

    expect(policy.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({ targetStatus: "HIDDEN", reason: "admin_update" }),
    );
    expect(result.publicationStatus).toBe("HIDDEN");
    expect(events.publish).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "product.published" }),
    );
  });
});

describe("SellerProductService.deleteProduct", () => {
  it("throws SellerProductNotFoundError when the product does not exist", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await expect(service.deleteProduct(null, "missing")).rejects.toBeInstanceOf(
      SellerProductNotFoundError,
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("deletes a product as admin (sellerId: null) and publishes product.deleted", async () => {
    const product = makeProduct({ id: "product-1", name: "Молоко" });
    const repo = fakeRepo({ getById: vi.fn(async () => product) });
    const events = fakeEventBus();
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), events);

    await service.deleteProduct(null, "product-1");

    expect(repo.delete).toHaveBeenCalledWith("product-1", null);
    expect(events.publish).toHaveBeenCalledWith({
      type: "product.deleted",
      productId: "product-1",
      name: "Молоко",
    });
  });

  it("scopes deletion to the owning seller when sellerId is provided", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const service = new SellerProductService(repo, fakeCategories(), fakePolicy(), fakeEventBus());

    await service.deleteProduct("seller-1", "product-1");

    expect(repo.getById).toHaveBeenCalledWith("product-1", "seller-1");
    expect(repo.delete).toHaveBeenCalledWith("product-1", "seller-1");
  });
});

describe("SellerProductService — product can be assigned to a subcategory", () => {
  it("createProduct accepts a categoryId that itself has a parentId (a subcategory), same as any other category", async () => {
    const subcategory = makeCategory({ id: "sub-1", parentId: "parent-1" });
    const categories = fakeCategories({
      getById: vi.fn(async (id: string) => (id === "sub-1" ? subcategory : null)),
    });
    const repo = fakeRepo();
    const policy = fakePolicy();
    const service = new SellerProductService(repo, categories, policy, fakeEventBus());

    await service.createProduct(null, {
      name: "Мука пшеничная",
      price: 100,
      categoryId: "sub-1",
    });

    expect(categories.getById).toHaveBeenCalledWith("sub-1");
    expect(repo.create).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ categoryId: "sub-1" }),
    );
  });
});

describe("SellerProductService publish/hide", () => {
  it("publishProduct asserts seller_publish, delegates to setPublicationStatus, and publishes product.published", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const policy = fakePolicy();
    const events = fakeEventBus();
    const service = new SellerProductService(repo, fakeCategories(), policy, events);

    const product = await service.publishProduct("seller-1", "product-1");

    expect(policy.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "seller_publish", targetStatus: "PUBLISHED" }),
    );
    expect(repo.setPublicationStatus).toHaveBeenCalledWith("seller-1", "product-1", "PUBLISHED");
    expect(events.publish).toHaveBeenCalledWith({ type: "product.published", product });
  });

  it("hideProduct asserts seller_hide, delegates to setPublicationStatus, and does not publish product.published", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeProduct({ publicationStatus: "PUBLISHED" })),
    });
    const policy = fakePolicy();
    const events = fakeEventBus();
    const service = new SellerProductService(repo, fakeCategories(), policy, events);

    await service.hideProduct("seller-1", "product-1");

    expect(policy.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "seller_hide", targetStatus: "HIDDEN" }),
    );
    expect(repo.setPublicationStatus).toHaveBeenCalledWith("seller-1", "product-1", "HIDDEN");
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("does not call setPublicationStatus when the policy denies the transition", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const policy = fakePolicy({
      assertCanTransition: vi.fn(() => {
        throw new Error("denied");
      }),
    });
    const service = new SellerProductService(repo, fakeCategories(), policy, fakeEventBus());

    await expect(service.publishProduct("seller-1", "product-1")).rejects.toThrow("denied");
    expect(repo.setPublicationStatus).not.toHaveBeenCalled();
  });
});
