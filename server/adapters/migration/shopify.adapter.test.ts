import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ShopifyCatalogAdapter } from "@server/adapters/migration/shopify.adapter";

function graphqlResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

function productNode(overrides: Record<string, unknown> = {}) {
  return {
    id: "gid://shopify/Product/1",
    title: "Fresh Apples",
    description: "Crisp and sweet",
    handle: "fresh-apples",
    priceRange: { minVariantPrice: { amount: "120.5", currencyCode: "KGS" } },
    images: { edges: [{ node: { url: "https://example.com/apple.jpg", altText: null } }] },
    variants: { edges: [{ node: { availableForSale: true } }] },
    ...overrides,
  };
}

describe("ShopifyCatalogAdapter", () => {
  beforeAll(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "fake-service-role-key-for-wiring-test-only";
    process.env.SHOPIFY_STORE_DOMAIN = "example.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_TOKEN = "fake-storefront-token";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const adapter = new ShopifyCatalogAdapter();

  it("maps a product node to a ProductDTO, parsing price and deriving inStock from the first variant", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        graphqlResponse({
          products: { edges: [{ node: productNode() }], pageInfo: { hasNextPage: false } },
        }),
      ),
    );

    const result = await adapter.list({});

    expect(result.items).toEqual([
      {
        id: "gid://shopify/Product/1",
        name: "Fresh Apples",
        slug: "fresh-apples",
        description: "Crisp and sweet",
        price: 120.5,
        currency: "KGS",
        unit: null,
        imageUrl: "https://example.com/apple.jpg",
        stock: 1,
        inStock: true,
        categoryId: null,
      },
    ]);
  });

  it("defaults imageUrl to null and inStock to false when images/variants are empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        graphqlResponse({
          products: {
            edges: [
              {
                node: productNode({
                  images: { edges: [] },
                  variants: { edges: [] },
                }),
              },
            ],
            pageInfo: { hasNextPage: false },
          },
        }),
      ),
    );

    const result = await adapter.list({});

    expect(result.items[0]?.imageUrl).toBeNull();
    expect(result.items[0]?.inStock).toBe(false);
    expect(result.items[0]?.stock).toBe(0);
  });

  it("filters by search across name and description, case-insensitively", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        graphqlResponse({
          products: {
            edges: [
              { node: productNode({ title: "Fresh Apples" }) },
              { node: productNode({ id: "gid://shopify/Product/2", title: "Ripe Bananas" }) },
            ],
            pageInfo: { hasNextPage: false },
          },
        }),
      ),
    );

    const result = await adapter.list({ search: "APPLE" });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Fresh Apples");
  });

  it("filters to in-stock items only when inStockOnly is set", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        graphqlResponse({
          products: {
            edges: [
              {
                node: productNode({ variants: { edges: [{ node: { availableForSale: true } }] } }),
              },
              {
                node: productNode({
                  id: "gid://shopify/Product/2",
                  variants: { edges: [{ node: { availableForSale: false } }] },
                }),
              },
            ],
            pageInfo: { hasNextPage: false },
          },
        }),
      ),
    );

    const result = await adapter.list({ inStockOnly: true });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.inStock).toBe(true);
  });

  it("carries hasMore through from Shopify's pageInfo", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        graphqlResponse({
          products: { edges: [{ node: productNode() }], pageInfo: { hasNextPage: true } },
        }),
      ),
    );

    const result = await adapter.list({});
    expect(result.hasMore).toBe(true);
  });

  it("returns null from getBySlug when Shopify has no matching product", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => graphqlResponse({ productByHandle: null })),
    );

    const result = await adapter.getBySlug("missing-product");
    expect(result).toBeNull();
  });

  it("throws when the HTTP response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("error", { status: 500 })),
    );

    await expect(adapter.getBySlug("x")).rejects.toThrow("Shopify API error: 500");
  });

  it("throws with joined messages when the GraphQL response carries errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ errors: [{ message: "Field not found" }, { message: "Bad query" }] }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
      ),
    );

    await expect(adapter.getBySlug("x")).rejects.toThrow("Field not found, Bad query");
  });

  describe("checkStock", () => {
    it("returns false when the product does not exist", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => graphqlResponse({ product: null })),
      );

      const result = await adapter.checkStock("missing", 1);
      expect(result).toBe(false);
    });

    it("returns true only when in stock with enough stock for the requested quantity", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => graphqlResponse({ product: productNode() })),
      );

      // Shopify-backed stock is always exactly 1 when available (see toProductDTO).
      expect(await adapter.checkStock("p1", 1)).toBe(true);
      expect(await adapter.checkStock("p1", 2)).toBe(false);
    });
  });

  describe("reserveStock", () => {
    it("throws InsufficientStockError when an item is not available", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => graphqlResponse({ product: null })),
      );

      await expect(adapter.reserveStock([{ productId: "missing", quantity: 1 }])).rejects.toThrow();
    });
  });
});
