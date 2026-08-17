import type { CategoryDTO } from "@shared/contracts/catalog";
import { getCategoryBySlugFn, listCategoriesFn } from "@/api/category.functions";

/** Category API — calls Platform Layer server functions. */
export async function listCategories(): Promise<CategoryDTO[]> {
  return listCategoriesFn();
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDTO | null> {
  return getCategoryBySlugFn({ data: { slug } });
}
