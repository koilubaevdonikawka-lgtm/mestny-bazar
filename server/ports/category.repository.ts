import type { CategoryDTO } from "@shared/contracts/catalog";

export interface ICategoryRepository {
  list(): Promise<CategoryDTO[]>;
  getBySlug(slug: string): Promise<CategoryDTO | null>;
}
