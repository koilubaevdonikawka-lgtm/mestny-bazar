import type { ProductDTO, ProductListParams, ProductListResult } from "@shared/contracts/catalog";
import { getProductBySlugFn, listProductsFn } from "@/api/catalog.functions";

/** Catalog API — calls Platform Layer server functions (Stage 3). */
export async function listProducts(params?: ProductListParams): Promise<ProductListResult> {
  return listProductsFn({ data: params ?? {} });
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  return getProductBySlugFn({ data: { slug } });
}
