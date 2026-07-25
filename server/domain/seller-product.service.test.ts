import { describe, expect, it, vi } from "vitest";
import { SellerProductService } from "@server/domain/seller-product.service";
import {
  SellerProductNotFoundError,
  SellerProductValidationError,
} from "@server/domain/seller-product.errors";
import type { ISellerProductRepository } from "@server/ports/seller-product.repository";
import type { IProductPublicationPolicy } from "@server/ports/product-publication.port";
import type { SellerProductDTO } from "@shared/contracts/seller-product";

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
    stock: 5,
    publicationStatus: "DRAFT",
    categoryId: null,
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<ISellerProductRepository> = {}): ISellerProductRepository {
  return {
    listBySeller: vi.fn(async () => []),
    getById: vi.fn(async () => null),
    create: vi.fn(async (_sellerId, data) => makeProduct({ ...data, slug: data.slug! })),
    update: vi.fn(async () => makeProduct()),
    setPublicationStatus: vi.fn(async (_sellerId, _id, status) =>
      makeProduct({ publicationStatus: status }),
    ),
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

describe("SellerProductService.createProduct", () => {
  it("rejects a name shorter than 2 characters", async () => {
    const repo = fakeRepo();
    const service = new SellerProductService(repo, fakePolicy());

    await expect(
      service.createProduct("seller-1", { name: "A", price: 10 }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("rejects a negative price", async () => {
    const repo = fakeRepo();
    const service = new SellerProductService(repo, fakePolicy());

    await expect(
      service.createProduct("seller-1", { name: "Valid Name", price: -1 }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
  });

  it("rejects a non-integer stock", async () => {
    const repo = fakeRepo();
    const service = new SellerProductService(repo, fakePolicy());

    await expect(
      service.createProduct("seller-1", { name: "Valid Name", price: 10, stock: 1.5 }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
  });

  it("falls back to a timestamp-based slug for a name that strips to nothing", async () => {
    const repo = fakeRepo();
    const service = new SellerProductService(repo, fakePolicy());

    // Cyrillic characters are not in slugify's [a-z0-9\s-] allowlist, so a
    // Cyrillic-only name strips down to nothing rather than a usable slug.
    await service.createProduct("seller-1", { name: "Свежий Хлеб!!", price: 10 });
    const [, payload] = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload.slug).toMatch(/^product-\d+$/);
  });

  it("falls back to an ASCII-only slug for a Latin name", async () => {
    const repo = fakeRepo();
    const service = new SellerProductService(repo, fakePolicy());

    await service.createProduct("seller-1", { name: "Fresh Bread!!", price: 10 });
    const [, payload] = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload.slug).toBe("fresh-bread");
  });

  it("appends a numeric suffix when the slug is already taken", async () => {
    const repo = fakeRepo({
      slugExists: vi.fn(async (slug: string) => slug === "fresh-bread"),
    });
    const service = new SellerProductService(repo, fakePolicy());

    await service.createProduct("seller-1", { name: "Fresh Bread", price: 10 });
    const [, payload] = (repo.create as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload.slug).toBe("fresh-bread-2");
  });

  it("checks the publication policy allows seller_create before creating", async () => {
    const policy = fakePolicy({
      assertCanTransition: vi.fn(() => {
        throw new Error("denied");
      }),
    });
    const repo = fakeRepo();
    const service = new SellerProductService(repo, policy);

    await expect(
      service.createProduct("seller-1", { name: "Fresh Bread", price: 10 }),
    ).rejects.toThrow("denied");
    expect(repo.create).not.toHaveBeenCalled();
  });
});

describe("SellerProductService.updateProduct", () => {
  it("throws SellerProductNotFoundError for a product the seller does not own", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new SellerProductService(repo, fakePolicy());

    await expect(
      service.updateProduct("seller-1", { id: "product-1", price: 20 }),
    ).rejects.toBeInstanceOf(SellerProductNotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("validates price when it is being changed", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const service = new SellerProductService(repo, fakePolicy());

    await expect(
      service.updateProduct("seller-1", { id: "product-1", price: -5 }),
    ).rejects.toBeInstanceOf(SellerProductValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });
});

describe("SellerProductService publish/hide", () => {
  it("publishProduct asserts seller_publish and delegates to setPublicationStatus", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const policy = fakePolicy();
    const service = new SellerProductService(repo, policy);

    await service.publishProduct("seller-1", "product-1");

    expect(policy.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "seller_publish", targetStatus: "PUBLISHED" }),
    );
    expect(repo.setPublicationStatus).toHaveBeenCalledWith("seller-1", "product-1", "PUBLISHED");
  });

  it("hideProduct asserts seller_hide and delegates to setPublicationStatus", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeProduct({ publicationStatus: "PUBLISHED" })),
    });
    const policy = fakePolicy();
    const service = new SellerProductService(repo, policy);

    await service.hideProduct("seller-1", "product-1");

    expect(policy.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "seller_hide", targetStatus: "HIDDEN" }),
    );
    expect(repo.setPublicationStatus).toHaveBeenCalledWith("seller-1", "product-1", "HIDDEN");
  });

  it("does not call setPublicationStatus when the policy denies the transition", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeProduct()) });
    const policy = fakePolicy({
      assertCanTransition: vi.fn(() => {
        throw new Error("denied");
      }),
    });
    const service = new SellerProductService(repo, policy);

    await expect(service.publishProduct("seller-1", "product-1")).rejects.toThrow("denied");
    expect(repo.setPublicationStatus).not.toHaveBeenCalled();
  });
});
