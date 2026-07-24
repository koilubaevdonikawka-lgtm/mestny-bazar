import type { Catalog, Category } from "@server/application/modules/catalog/catalog/models";

/** Catalog persistence contract — implemented by infrastructure adapters. */
export interface ICatalogStore {
  saveCatalog(catalog: Catalog): Promise<void>;
  updateCatalog(catalog: Catalog): Promise<void>;
  findCatalogById(catalogId: string): Promise<Catalog | null>;
  saveCategory(category: Category): Promise<void>;
  updateCategory(category: Category): Promise<void>;
  findCategoryById(categoryId: string): Promise<Category | null>;
  findCategoriesByCatalogId(catalogId: string): Promise<readonly Category[]>;
}
