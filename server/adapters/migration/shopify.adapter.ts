import type { ProductDTO, ProductListParams, ProductListResult } from "@shared/contracts/catalog";
import type { IProductRepository, StockReservationItem } from "@server/ports/product.repository";
import { getServerEnv } from "@server/config/env";
import { InsufficientStockError } from "@server/domain/checkout.errors";

interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface ShopifyProductNode {
  id: string;
  title: string;
  description: string;
  handle: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: {
    edges: Array<{ node: { url: string; altText: string | null } }>;
  };
  variants: {
    edges: Array<{
      node: {
        availableForSale: boolean;
      };
    }>;
  };
}

/**
 * Temporary migration adapter — reads Shopify Storefront API from server env.
 * Replaces client-side lib/shopify.ts when FEATURE_CATALOG_SOURCE=shopify via Platform API.
 */
export class ShopifyCatalogAdapter implements IProductRepository {
  private getConfig() {
    const env = getServerEnv();
    const domain = env.SHOPIFY_STORE_DOMAIN;
    const token = env.SHOPIFY_STOREFRONT_TOKEN;
    if (!domain || !token) {
      throw new Error("SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN are required");
    }
    return {
      url: `https://${domain}/api/${env.SHOPIFY_API_VERSION}/graphql.json`,
      token,
    };
  }

  private async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const { url, token } = this.getConfig();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }
    const json = (await response.json()) as ShopifyGraphQLResponse<T>;
    if (json.errors?.length) {
      throw new Error(json.errors.map((e) => e.message).join(", "));
    }
    if (!json.data) {
      throw new Error("Shopify API returned no data");
    }
    return json.data;
  }

  async list(params: ProductListParams): Promise<ProductListResult> {
    const pageSize = params.pageSize ?? 24;
    const data = await this.graphql<{
      products: {
        edges: Array<{ node: ShopifyProductNode }>;
        pageInfo: { hasNextPage: boolean };
      };
    }>(
      `query Products($first: Int!) {
        products(first: $first) {
          edges { node {
            id title description handle
            priceRange { minVariantPrice { amount currencyCode } }
            images(first: 1) { edges { node { url altText } } }
            variants(first: 1) { edges { node { availableForSale } } }
          } }
          pageInfo { hasNextPage }
        }
      }`,
      { first: pageSize },
    );

    let items = data.products.edges.map((e) => this.toProductDTO(e.node));

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
      );
    }
    if (params.inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    return {
      items,
      total: items.length,
      page: params.page ?? 1,
      pageSize,
      hasMore: data.products.pageInfo.hasNextPage,
    };
  }

  async getBySlug(slug: string): Promise<ProductDTO | null> {
    const data = await this.graphql<{
      productByHandle: ShopifyProductNode | null;
    }>(
      `query Product($handle: String!) {
        productByHandle(handle: $handle) {
          id title description handle
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url altText } } }
          variants(first: 1) { edges { node { availableForSale } } }
        }
      }`,
      { handle: slug },
    );
    return data.productByHandle ? this.toProductDTO(data.productByHandle) : null;
  }

  async getById(id: string): Promise<ProductDTO | null> {
    const data = await this.graphql<{
      product: ShopifyProductNode | null;
    }>(
      `query ProductById($id: ID!) {
        product(id: $id) {
          id title description handle
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url altText } } }
          variants(first: 1) { edges { node { availableForSale } } }
        }
      }`,
      { id },
    );
    return data.product ? this.toProductDTO(data.product) : null;
  }

  /**
   * No batch-by-handle/id query exists in the Storefront API without alias
   * tricks; this adapter is never used for checkout in practice (see
   * server/di/container.ts), so a parallel fan-out is an acceptable fallback.
   */
  async getManyByIds(ids: string[]): Promise<ProductDTO[]> {
    const results = await Promise.all(ids.map((id) => this.getById(id)));
    return results.filter((product): product is ProductDTO => product !== null);
  }

  async getManyBySlugs(slugs: string[]): Promise<ProductDTO[]> {
    const results = await Promise.all(slugs.map((slug) => this.getBySlug(slug)));
    return results.filter((product): product is ProductDTO => product !== null);
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.getById(productId);
    if (!product) return false;
    return product.inStock && product.stock >= quantity;
  }

  /**
   * Shopify inventory is not owned by this platform — there is no real reservation
   * to make here. Best-effort availability re-check only; not atomic against
   * concurrent orders (this adapter is never used for checkout in practice, see
   * server/di/container.ts — checkout always uses SupabaseProductRepository).
   */
  async reserveStock(items: StockReservationItem[]): Promise<void> {
    for (const item of items) {
      const available = await this.checkStock(item.productId, item.quantity);
      if (!available) throw new InsufficientStockError(item.productId);
    }
  }

  async releaseStock(): Promise<void> {
    // No-op: nothing was actually reserved in Shopify's inventory.
  }

  private toProductDTO(node: ShopifyProductNode): ProductDTO {
    const price = parseFloat(node.priceRange.minVariantPrice.amount);
    const inStock = node.variants.edges[0]?.node.availableForSale ?? false;
    return {
      id: node.id,
      name: node.title,
      slug: node.handle,
      description: node.description,
      price,
      currency: node.priceRange.minVariantPrice.currencyCode,
      unit: null,
      imageUrl: node.images.edges[0]?.node.url ?? null,
      stock: inStock ? 1 : 0,
      inStock,
      categoryId: null,
    };
  }
}
