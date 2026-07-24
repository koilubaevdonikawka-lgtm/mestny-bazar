import type { ICatalogStore } from "@server/application/modules/catalog/catalog/contracts";
import type { Catalog, Category } from "@server/application/modules/catalog/catalog/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory catalog store for development and tests. */
export class MemoryCatalogStore implements ICatalogStore {
  private readonly catalogs = new InMemoryStore<Catalog>((catalog) => catalog.id);
  private readonly categories = new InMemoryStore<Category>((category) => category.id);
  private readonly categoriesByCatalog = new Map<string, Set<string>>();

  async saveCatalog(catalog: Catalog): Promise<void> {
    this.catalogs.set(catalog);
  }

  async updateCatalog(catalog: Catalog): Promise<void> {
    if (!this.catalogs.has(catalog.id)) {
      throw new Error(`Catalog not found: ${catalog.id}`);
    }
    this.catalogs.set(catalog);
  }

  async findCatalogById(catalogId: string): Promise<Catalog | null> {
    return this.catalogs.get(catalogId) ?? null;
  }

  async saveCategory(category: Category): Promise<void> {
    this.categories.set(category);
    const bucket = this.categoriesByCatalog.get(category.catalogId) ?? new Set<string>();
    bucket.add(category.id);
    this.categoriesByCatalog.set(category.catalogId, bucket);
  }

  async updateCategory(category: Category): Promise<void> {
    if (!this.categories.has(category.id)) {
      throw new Error(`Category not found: ${category.id}`);
    }
    this.categories.set(category);
  }

  async findCategoryById(categoryId: string): Promise<Category | null> {
    return this.categories.get(categoryId) ?? null;
  }

  async findCategoriesByCatalogId(catalogId: string): Promise<readonly Category[]> {
    const ids = this.categoriesByCatalog.get(catalogId);
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((categoryId) => this.categories.get(categoryId))
        .filter((category): category is Category => category !== undefined)
        .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)),
    );
  }
}
