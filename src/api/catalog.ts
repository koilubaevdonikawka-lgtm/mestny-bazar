import type { ProductDTO, ProductListParams, ProductListResult } from "@shared/contracts/catalog";

/**
 * Catalog API — calls Platform Layer server functions.
 * Not wired to UI until Stage 3 (FEATURE_CATALOG_SOURCE switch).
 */
export async function listProducts(_params?: ProductListParams): Promise<ProductListResult> {
  const { listProductsFn } = await import("@server/functions/catalog.functions");
  return listProductsFn({ data: _params ?? {} });
}

export async function getProductBySlug(_slug: string): Promise<ProductDTO | null> {
  const { getProductBySlugFn } = await import("@server/functions/catalog.functions");
  return getProductBySlugFn({ data: { slug: _slug } });
}
