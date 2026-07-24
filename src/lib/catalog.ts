import type { ShopifyProduct } from "@/lib/shopify";
import {
  STOREFRONT_PRODUCT_BY_HANDLE_QUERY,
  STOREFRONT_PRODUCTS_QUERY,
  storefrontApiRequest,
} from "@/lib/shopify";
import { getProductBySlug, listProducts } from "@/api/catalog";
import { isPlatformCatalog } from "@/config/features";
import { toShopifyProductShim } from "@/lib/product-adapter";

/**
 * Catalog source switch (Stage 3): platform reads go through the Platform API
 * (src/api/catalog.ts), shopify reads keep calling Storefront GraphQL directly, matching
 * FEATURE_CATALOG_SOURCE / isPlatformCatalog(). Both branches resolve to the ShopifyProduct
 * shape so product rendering and cart/checkout code stay source-agnostic.
 */
export async function fetchCatalogProducts(): Promise<ShopifyProduct[]> {
  if (isPlatformCatalog()) {
    const result = await listProducts();
    return result.items.map(toShopifyProductShim);
  }
  const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 24, query: null });
  return data?.data?.products?.edges ?? [];
}

export async function fetchCatalogProduct(handle: string): Promise<ShopifyProduct["node"] | null> {
  if (isPlatformCatalog()) {
    const product = await getProductBySlug(handle);
    return product ? toShopifyProductShim(product).node : null;
  }
  const data = await storefrontApiRequest(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });
  return data?.data?.product ?? null;
}
