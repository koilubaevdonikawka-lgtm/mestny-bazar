import type { ICatalogRepository } from "@server/application/ports";
import type { Catalog, CatalogReadModel } from "@server/domain/catalog";
import { InMemoryStore, reconstituteCatalog } from "@server/infrastructure/shared";

/** In-memory catalog repository — replaceable with persistent adapter. */
export class InMemoryCatalogRepository implements ICatalogRepository {
  private readonly store = new InMemoryStore<CatalogReadModel>((item) => item.id);

  async save(catalog: Catalog): Promise<void> {
    this.store.set(catalog.snapshot().toJSON());
  }

  async findById(id: string): Promise<Catalog | null> {
    const model = this.store.get(id);
    return model ? reconstituteCatalog(model) : null;
  }

  async findSnapshotById(id: string): Promise<CatalogReadModel | null> {
    return this.store.get(id) ?? null;
  }

  async exists(id: string): Promise<boolean> {
    return this.store.has(id);
  }
}
