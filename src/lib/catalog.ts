import type { ShopifyProduct } from "@/lib/shopify";
import {
  STOREFRONT_PRODUCT_BY_HANDLE_QUERY,
  STOREFRONT_PRODUCTS_QUERY,
  storefrontApiRequest,
} from "@/lib/shopify";
import { getProductBySlug, listProducts } from "@/api/catalog";
import { isPlatformCatalog } from "@/config/features";
import { toShopifyProductShim } from "@shared/lib/product-adapter";

/** One "Показать ещё" batch, same size regardless of catalog source. */
export const CATALOG_PAGE_SIZE = 24;

export interface CatalogPage {
  items: ShopifyProduct[];
  hasMore: boolean;
  /**
   * Opaque token for fetching the next page — a stringified page number for
   * the Platform source (offset pagination), a real GraphQL cursor for
   * Shopify (cursor pagination). Callers never need to know which.
   */
  nextCursor: string | null;
}

/**
 * Catalog source switch (Stage 3): platform reads go through the Platform API
 * (src/api/catalog.ts), shopify reads keep calling Storefront GraphQL directly, matching
 * FEATURE_CATALOG_SOURCE / isPlatformCatalog(). Both branches resolve to the ShopifyProduct
 * shape so product rendering and cart/checkout code stay source-agnostic.
 *
 * cursor is the nextCursor from a previous call, or omitted/null for the
 * first page — pass it back to fetch the next batch instead of reloading
 * everything already fetched.
 */
export async function fetchCatalogProducts(
  search?: string,
  cursor?: string | null,
): Promise<CatalogPage> {
  const trimmed = search?.trim() || null;

  if (isPlatformCatalog()) {
    const page = cursor ? Number(cursor) : 1;
    const result = await listProducts({
      ...(trimmed ? { search: trimmed } : {}),
      page,
      pageSize: CATALOG_PAGE_SIZE,
    });
    return {
      items: result.items.map(toShopifyProductShim),
      hasMore: result.hasMore,
      nextCursor: result.hasMore ? String(page + 1) : null,
    };
  }

  const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, {
    first: CATALOG_PAGE_SIZE,
    query: trimmed,
    after: cursor ?? null,
  });
  const items: ShopifyProduct[] = data?.data?.products?.edges ?? [];
  const pageInfo = data?.data?.products?.pageInfo as
    { hasNextPage: boolean; endCursor: string | null } | undefined;

  return {
    items,
    hasMore: pageInfo?.hasNextPage ?? false,
    nextCursor: pageInfo?.hasNextPage ? (pageInfo.endCursor ?? null) : null,
  };
}

export async function fetchCatalogProduct(handle: string): Promise<ShopifyProduct["node"] | null> {
  if (isPlatformCatalog()) {
    const product = await getProductBySlug(handle);
    return product ? toShopifyProductShim(product).node : null;
  }
  const data = await storefrontApiRequest(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });
  return data?.data?.product ?? null;
}
