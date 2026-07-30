import type { CategoryDTO } from "@shared/contracts/catalog";
import type { ICategoryRepository } from "@server/ports/category.repository";

export class CategoryService {
  constructor(private readonly categories: ICategoryRepository) {}

  async listCategories(): Promise<CategoryDTO[]> {
    return this.categories.list();
  }
}
