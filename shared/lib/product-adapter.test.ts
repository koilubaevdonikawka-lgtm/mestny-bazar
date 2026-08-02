import { describe, expect, it } from "vitest";
import {
  isPlatformVariantId,
  PLATFORM_VARIANT_PREFIX,
  toCatalogProductNode,
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

  it("rejects an unprefixed id", () => {
    expect(isPlatformVariantId("some-other-id")).toBe(false);
  });
});

describe("toCatalogProductNode", () => {
  it("prefixes the variant/product id with the platform marker", () => {
    const node = toCatalogProductNode(fakeProduct({ id: "prod-1" }));
    expect(node.node.id).toBe("platform:prod-1");
    expect(node.node.variants.edges[0]?.node.id).toBe("platform:prod-1");
  });

  it("maps name, slug and description onto the catalog node fields", () => {
    const node = toCatalogProductNode(fakeProduct());
    expect(node.node.title).toBe("Fresh Apples");
    expect(node.node.handle).toBe("fresh-apples");
    expect(node.node.description).toBe("Crisp and sweet");
  });

  it("falls back to an empty description when null", () => {
    const node = toCatalogProductNode(fakeProduct({ description: null }));
    expect(node.node.description).toBe("");
  });

  it("formats price to two decimals and carries the currency code", () => {
    const node = toCatalogProductNode(fakeProduct({ price: 99, currency: "USD" }));
    expect(node.node.priceRange.minVariantPrice).toEqual({ amount: "99.00", currencyCode: "USD" });
    expect(node.node.variants.edges[0]?.node.price).toEqual({
      amount: "99.00",
      currencyCode: "USD",
    });
  });

  it("includes one image edge when imageUrl is set, using the product name as alt text", () => {
    const node = toCatalogProductNode(fakeProduct({ imageUrl: "https://example.com/x.jpg" }));
    expect(node.node.images.edges).toEqual([
      { node: { url: "https://example.com/x.jpg", altText: "Fresh Apples" } },
    ]);
  });

  it("produces no image edges when imageUrl is null", () => {
    const node = toCatalogProductNode(fakeProduct({ imageUrl: null }));
    expect(node.node.images.edges).toEqual([]);
  });

  it("carries inStock through to availableForSale on the single variant", () => {
    expect(
      toCatalogProductNode(fakeProduct({ inStock: true })).node.variants.edges[0]?.node
        .availableForSale,
    ).toBe(true);
    expect(
      toCatalogProductNode(fakeProduct({ inStock: false })).node.variants.edges[0]?.node
        .availableForSale,
    ).toBe(false);
  });

  it("always produces exactly one variant with no selectable options", () => {
    const node = toCatalogProductNode(fakeProduct());
    expect(node.node.variants.edges).toHaveLength(1);
    expect(node.node.variants.edges[0]?.node.selectedOptions).toEqual([]);
    expect(node.node.options).toEqual([]);
  });
});
