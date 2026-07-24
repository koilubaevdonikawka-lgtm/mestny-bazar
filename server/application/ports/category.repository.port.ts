import type { Category } from "@server/domain/catalog";
import type { CategoryReadModel } from "@server/domain/catalog";

/** Category persistence port — implementation lives in adapters. */
export interface ICategoryRepository {
  save(category: Category): Promise<void>;
  findById(id: string): Promise<Category | null>;
  findSnapshotById(id: string): Promise<CategoryReadModel | null>;
  findSnapshotsByCatalogId(catalogId: string): Promise<CategoryReadModel[]>;
  exists(id: string): Promise<boolean>;
}
