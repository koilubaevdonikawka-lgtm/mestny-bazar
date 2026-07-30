import type { CategoryDTO } from "@shared/contracts/catalog";

export interface ICategoryRepository {
  list(): Promise<CategoryDTO[]>;
}
