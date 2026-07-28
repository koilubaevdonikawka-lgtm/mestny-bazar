import { describe, expect, it } from "vitest";
import {
  isPlatformVariantId,
  PLATFORM_VARIANT_PREFIX,
  toShopifyProductShim,
} from "./product-adapter";
import type { ProductDTO } from "@shared/contracts/catalog";

function fakeProduct(overrides: Partial<ProductDTO> = {}): ProductDTO {
  return {
    id: "prod-1",
    name: "Fresh Apples",
    slug: "fresh-apples",
    description: "Crisp and sweet",
    price: 120.5,
    currency: "KGS",
    unit: "kg",
    imageUrl: "https://example.com/apple.jpg",
    stock: 10,
    inStock: true,
    categoryId: null,
    ...overrides,
  };
}

describe("isPlatformVariantId", () => {
  it("recognizes a platform-prefixed variant id", () => {
    expect(isPlatformVariantId(`${PLATFORM_VARIANT_PREFIX}prod-1`)).toBe(true);
  });

  it("rejects a raw Shopify gid", () => {
    expect(isPlatformVariantId("gid://shopify/ProductVariant/1")).toBe(false);
  });
});

describe("toShopifyProductShim", () => {
  it("prefixes the variant/product id with the platform marker", () => {
    const shim = toShopifyProductShim(fakeProduct({ id: "prod-1" }));
    expect(shim.node.id).toBe("platform:prod-1");
    expect(shim.node.variants.edges[0]?.node.id).toBe("platform:prod-1");
  });

  it("maps name, slug and description onto the Shopify-shaped fields", () => {
    const shim = toShopifyProductShim(fakeProduct());
    expect(shim.node.title).toBe("Fresh Apples");
    expect(shim.node.handle).toBe("fresh-apples");
    expect(shim.node.description).toBe("Crisp and sweet");
  });

  it("falls back to an empty description when null", () => {
    const shim = toShopifyProductShim(fakeProduct({ description: null }));
    expect(shim.node.description).toBe("");
  });

  it("formats price to two decimals and carries the currency code", () => {
    const shim = toShopifyProductShim(fakeProduct({ price: 99, currency: "USD" }));
    expect(shim.node.priceRange.minVariantPrice).toEqual({ amount: "99.00", currencyCode: "USD" });
    expect(shim.node.variants.edges[0]?.node.price).toEqual({
      amount: "99.00",
      currencyCode: "USD",
    });
  });

  it("includes one image edge when imageUrl is set, using the product name as alt text", () => {
    const shim = toShopifyProductShim(fakeProduct({ imageUrl: "https://example.com/x.jpg" }));
    expect(shim.node.images.edges).toEqual([
      { node: { url: "https://example.com/x.jpg", altText: "Fresh Apples" } },
    ]);
  });

  it("produces no image edges when imageUrl is null", () => {
    const shim = toShopifyProductShim(fakeProduct({ imageUrl: null }));
    expect(shim.node.images.edges).toEqual([]);
  });

  it("carries inStock through to availableForSale on the single variant", () => {
    expect(
      toShopifyProductShim(fakeProduct({ inStock: true })).node.variants.edges[0]?.node
        .availableForSale,
    ).toBe(true);
    expect(
      toShopifyProductShim(fakeProduct({ inStock: false })).node.variants.edges[0]?.node
        .availableForSale,
    ).toBe(false);
  });

  it("always produces exactly one variant with no selectable options", () => {
    const shim = toShopifyProductShim(fakeProduct());
    expect(shim.node.variants.edges).toHaveLength(1);
    expect(shim.node.variants.edges[0]?.node.selectedOptions).toEqual([]);
    expect(shim.node.options).toEqual([]);
  });
});
