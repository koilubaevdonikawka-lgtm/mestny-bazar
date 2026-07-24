import type { IProductRepository } from "@server/application/ports";
import type { Product, ProductReadModel } from "@server/domain/product";
import { InMemoryStore, reconstituteProduct } from "@server/infrastructure/shared";

/** In-memory product repository — replaceable with persistent adapter. */
export class InMemoryProductRepository implements IProductRepository {
  private readonly store = new InMemoryStore<ProductReadModel>((item) => item.id);

  async save(product: Product): Promise<void> {
    this.store.set(product.snapshot().toJSON());
  }

  async findById(id: string): Promise<Product | null> {
    const model = this.store.get(id);
    return model ? reconstituteProduct(model) : null;
  }

  async findSnapshotById(id: string): Promise<ProductReadModel | null> {
    return this.store.get(id) ?? null;
  }

  async exists(id: string): Promise<boolean> {
    return this.store.has(id);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
