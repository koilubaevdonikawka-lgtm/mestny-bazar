import type { ISellerRepository } from "@server/application/ports";
import type { Seller, SellerReadModel } from "@server/domain/seller";
import { InMemoryStore, reconstituteSeller } from "@server/infrastructure/shared";

/** In-memory seller repository — replaceable with persistent adapter. */
export class InMemorySellerRepository implements ISellerRepository {
  private readonly store = new InMemoryStore<SellerReadModel>((item) => item.id);

  async save(seller: Seller): Promise<void> {
    this.store.set(seller.snapshot().toJSON());
  }

  async findById(id: string): Promise<Seller | null> {
    const model = this.store.get(id);
    return model ? reconstituteSeller(model) : null;
  }

  async findSnapshotById(id: string): Promise<SellerReadModel | null> {
    return this.store.get(id) ?? null;
  }

  async exists(id: string): Promise<boolean> {
    return this.store.has(id);
  }
}
