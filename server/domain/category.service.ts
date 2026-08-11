import type { CategoryDTO, CategoryTreeNode } from "@shared/contracts/catalog";
import type { ICategoryRepository } from "@server/ports/category.repository";
import { buildCategoryTree, getCategoryAncestry } from "@shared/lib/category-tree";

export class CategoryService {
  constructor(private readonly categories: ICategoryRepository) {}

  async listCategories(): Promise<CategoryDTO[]> {
    return this.categories.list();
  }

  async getCategoryBySlug(slug: string): Promise<CategoryDTO | null> {
    return this.categories.getBySlug(slug);
  }

  /** Stage 10: architecture only, no UI consumer yet — built in-memory from
   * the same flat, active-only list() the rest of the catalog already uses. */
  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.categories.list();
    return buildCategoryTree(categories);
  }

  /** Root-first ancestor chain for a category, e.g. for a future breadcrumb
   * that needs to show Home > Grandparent > Parent > Category. */
  async getCategoryAncestry(slug: string): Promise<CategoryDTO[]> {
    const categories = await this.categories.list();
    const category = categories.find((c) => c.slug === slug);
    if (!category) return [];
    return getCategoryAncestry(categories, category.id);
  }
}
