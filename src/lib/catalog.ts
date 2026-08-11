import type { CategoryDTO, ProductDTO, ProductSortBy } from "@shared/contracts/catalog";
import type { CatalogProductNode } from "@shared/lib/product-adapter";
import { getProductBySlug, listProducts } from "@/api/catalog";
import { getCategoryBySlug } from "@/api/category";
import { toCatalogProductNode } from "@shared/lib/product-adapter";

/** One "Показать ещё" batch. */
export const CATALOG_PAGE_SIZE = 24;

export interface CatalogPage {
  items: CatalogProductNode[];
  hasMore: boolean;
  /** Opaque token for fetching the next page — a stringified page number. */
  nextCursor: string | null;
  /** Total matches for the current filters/sort — independent of how many are loaded. */
  total: number;
}

export interface FetchCatalogProductsOptions {
  search?: string;
  cursor?: string | null;
  categorySlug?: string;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  manufacturers?: string[];
  countriesOfOrigin?: string[];
  sortBy?: ProductSortBy;
}

/**
 * Sole catalog read path (ADR-002) — always goes through the Platform API
 * (src/api/catalog.ts), which is backed exclusively by Supabase.
 */
export async function fetchCatalogProducts(
  options: FetchCatalogProductsOptions = {},
): Promise<CatalogPage> {
  const trimmed = options.search?.trim() || null;
  const page = options.cursor ? Number(options.cursor) : 1;
  const result = await listProducts({
    ...(trimmed ? { search: trimmed } : {}),
    ...(options.categorySlug ? { categorySlug: options.categorySlug } : {}),
    ...(options.inStockOnly ? { inStockOnly: true } : {}),
    ...(options.minPrice !== undefined ? { minPrice: options.minPrice } : {}),
    ...(options.maxPrice !== undefined ? { maxPrice: options.maxPrice } : {}),
    ...(options.manufacturers?.length ? { manufacturers: options.manufacturers } : {}),
    ...(options.countriesOfOrigin?.length ? { countriesOfOrigin: options.countriesOfOrigin } : {}),
    ...(options.sortBy ? { sortBy: options.sortBy } : {}),
    page,
    pageSize: CATALOG_PAGE_SIZE,
  });
  return {
    items: result.items.map(toCatalogProductNode),
    hasMore: result.hasMore,
    nextCursor: result.hasMore ? String(page + 1) : null,
    total: result.total,
  };
}

export async function fetchCatalogProduct(
  handle: string,
): Promise<CatalogProductNode["node"] | null> {
  const product = await getProductBySlug(handle);
  return product ? toCatalogProductNode(product).node : null;
}

export async function fetchCatalogCategory(slug: string): Promise<CategoryDTO | null> {
  return getCategoryBySlug(slug);
}

/**
 * Raw (non-Shopify-adapted) products for a category, unfiltered beyond
 * category scope — used only to derive available filter facet values
 * (manufacturer/country of origin), never rendered as product cards.
 */
export async function fetchCatalogCategoryFacetSource(categorySlug: string): Promise<ProductDTO[]> {
  const result = await listProducts({ categorySlug, pageSize: CATALOG_PAGE_SIZE });
  return result.items;
}
