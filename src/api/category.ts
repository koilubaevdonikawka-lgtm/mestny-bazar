import type { CategoryDTO } from "@shared/contracts/catalog";
import { listCategoriesFn } from "@/api/category.functions";

/** Category API — calls Platform Layer server functions. */
export async function listCategories(): Promise<CategoryDTO[]> {
  return listCategoriesFn();
}
