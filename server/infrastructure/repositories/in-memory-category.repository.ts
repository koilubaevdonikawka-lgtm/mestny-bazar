import type { ICategoryRepository } from "@server/application/ports";
import type { Category, CategoryReadModel } from "@server/domain/catalog";
import { InMemoryStore, reconstituteCategory } from "@server/infrastructure/shared";

/** In-memory category repository — replaceable with persistent adapter. */
export class InMemoryCategoryRepository implements ICategoryRepository {
  private readonly store = new InMemoryStore<CategoryReadModel>((item) => item.id);

  async save(category: Category): Promise<void> {
    this.store.set(category.snapshot().toJSON());
  }

  async findById(id: string): Promise<Category | null> {
    const model = this.store.get(id);
    return model ? reconstituteCategory(model) : null;
  }

  async findSnapshotById(id: string): Promise<CategoryReadModel | null> {
    return this.store.get(id) ?? null;
  }

  async findSnapshotsByCatalogId(catalogId: string): Promise<CategoryReadModel[]> {
    return this.store.find((item) => item.catalogId === catalogId);
  }

  async exists(id: string): Promise<boolean> {
    return this.store.has(id);
  }
}
