import type { CatalogProductNode } from "@shared/lib/product-adapter";
import { getProductBySlug, listProducts } from "@/api/catalog";
import { toCatalogProductNode } from "@shared/lib/product-adapter";

/** One "Показать ещё" batch. */
export const CATALOG_PAGE_SIZE = 24;

export interface CatalogPage {
  items: CatalogProductNode[];
  hasMore: boolean;
  /** Opaque token for fetching the next page — a stringified page number. */
  nextCursor: string | null;
}

/**
 * Sole catalog read path (ADR-002) — always goes through the Platform API
 * (src/api/catalog.ts), which is backed exclusively by Supabase.
 */
export async function fetchCatalogProducts(
  search?: string,
  cursor?: string | null,
): Promise<CatalogPage> {
  const trimmed = search?.trim() || null;
  const page = cursor ? Number(cursor) : 1;
  const result = await listProducts({
    ...(trimmed ? { search: trimmed } : {}),
    page,
    pageSize: CATALOG_PAGE_SIZE,
  });
  return {
    items: result.items.map(toCatalogProductNode),
    hasMore: result.hasMore,
    nextCursor: result.hasMore ? String(page + 1) : null,
  };
}

export async function fetchCatalogProduct(
  handle: string,
): Promise<CatalogProductNode["node"] | null> {
  const product = await getProductBySlug(handle);
  return product ? toCatalogProductNode(product).node : null;
}
