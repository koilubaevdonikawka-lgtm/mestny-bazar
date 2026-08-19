import { describe, expect, it, vi } from "vitest";
import { ProductVariantService } from "@server/domain/product-variant.service";
import {
  ProductVariantNotFoundError,
  ProductVariantValidationError,
} from "@server/domain/product-variant.errors";
import type { IProductVariantRepository } from "@server/ports/product-variant.repository";
import type { ISellerProductRepository } from "@server/ports/seller-product.repository";
import type { ProductVariantDTO } from "@shared/contracts/product-variant";
import type { SellerProductDTO } from "@shared/contracts/seller-product";

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

function makeSellerProduct(overrides: Partial<SellerProductDTO> = {}): SellerProductDTO {
  return {
    id: "prod-1",
    name: "Молоко",
    slug: "milk",
    description: null,
    price: 100,
    currency: "KGS",
    unit: null,
    imageUrl: null,
    imageUrls: [],
    manufacturer: null,
    countryOfOrigin: null,
    sku: null,
    weightKg: null,
    stock: 10,
    publicationStatus: "PUBLISHED",
    categoryId: null,
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

function fakeSellerProductRepo(
  overrides: Partial<ISellerProductRepository> = {},
): ISellerProductRepository {
  return {
    listBySeller: vi.fn(async () => []),
    listAll: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 20, hasMore: false })),
    getById: vi.fn(async () => makeSellerProduct()),
    create: vi.fn(async () => makeSellerProduct()),
    update: vi.fn(async () => makeSellerProduct()),
    setPublicationStatus: vi.fn(async () => makeSellerProduct()),
    delete: vi.fn(async () => {}),
    slugExists: vi.fn(async () => false),
    ...overrides,
  };
}

describe("ProductVariantService.createVariant", () => {
  it("rejects an unknown productId", async () => {
    const variants = fakeVariantRepo();
    const sellerProducts = fakeSellerProductRepo({ getById: vi.fn(async () => null) });
    const service = new ProductVariantService(variants, sellerProducts);

    await expect(
      service.createVariant({ productId: "missing", sku: "SKU-1" }),
    ).rejects.toBeInstanceOf(ProductVariantValidationError);
    expect(variants.create).not.toHaveBeenCalled();
  });

  it("rejects an empty sku", async () => {
    const service = new ProductVariantService(fakeVariantRepo(), fakeSellerProductRepo());

    await expect(service.createVariant({ productId: "prod-1", sku: "  " })).rejects.toBeInstanceOf(
      ProductVariantValidationError,
    );
  });

  it("rejects a negative price", async () => {
    const service = new ProductVariantService(fakeVariantRepo(), fakeSellerProductRepo());

    await expect(
      service.createVariant({ productId: "prod-1", sku: "SKU-1", price: -5 }),
    ).rejects.toBeInstanceOf(ProductVariantValidationError);
  });

  it("rejects a duplicate sku", async () => {
    const variants = fakeVariantRepo({ skuExists: vi.fn(async () => true) });
    const service = new ProductVariantService(variants, fakeSellerProductRepo());

    await expect(
      service.createVariant({ productId: "prod-1", sku: "SKU-1" }),
    ).rejects.toBeInstanceOf(ProductVariantValidationError);
    expect(variants.create).not.toHaveBeenCalled();
  });

  it("creates successfully with a valid product and unique sku", async () => {
    const variants = fakeVariantRepo();
    const service = new ProductVariantService(variants, fakeSellerProductRepo());

    await service.createVariant({ productId: "prod-1", sku: "SKU-1", price: 150 });
    expect(variants.create).toHaveBeenCalledWith({ productId: "prod-1", sku: "SKU-1", price: 150 });
  });

  it("allows an unset price (inherits parent product's price)", async () => {
    const variants = fakeVariantRepo();
    const service = new ProductVariantService(variants, fakeSellerProductRepo());

    await service.createVariant({ productId: "prod-1", sku: "SKU-1" });
    expect(variants.create).toHaveBeenCalledWith({ productId: "prod-1", sku: "SKU-1" });
  });
});

describe("ProductVariantService.updateVariant", () => {
  it("throws ProductVariantNotFoundError when the variant does not exist", async () => {
    const variants = fakeVariantRepo({ getById: vi.fn(async () => null) });
    const service = new ProductVariantService(variants, fakeSellerProductRepo());

    await expect(service.updateVariant({ id: "missing", sku: "SKU-2" })).rejects.toBeInstanceOf(
      ProductVariantNotFoundError,
    );
    expect(variants.update).not.toHaveBeenCalled();
  });

  it("rejects a sku collision with another variant", async () => {
    const variants = fakeVariantRepo({ skuExists: vi.fn(async () => true) });
    const service = new ProductVariantService(variants, fakeSellerProductRepo());

    await expect(service.updateVariant({ id: "var-1", sku: "SKU-TAKEN" })).rejects.toBeInstanceOf(
      ProductVariantValidationError,
    );
    expect(variants.update).not.toHaveBeenCalled();
  });

  it("updates successfully", async () => {
    const variants = fakeVariantRepo();
    const service = new ProductVariantService(variants, fakeSellerProductRepo());

    await service.updateVariant({ id: "var-1", publicationStatus: "PUBLISHED" });
    expect(variants.update).toHaveBeenCalledWith({ id: "var-1", publicationStatus: "PUBLISHED" });
  });
});
