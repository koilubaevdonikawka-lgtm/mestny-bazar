import type { ICartStore } from "@server/application/modules/cart/cart/contracts";
import type { CartSnapshot } from "@server/application/modules/cart/cart/models";
import { CartMapper } from "@server/infrastructure/marketplace/mappers";
import type { CartStoreRecord } from "@server/infrastructure/marketplace/shared";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory cart store for development and tests. */
export class MemoryCartStore implements ICartStore {
  private readonly store = new InMemoryStore<CartStoreRecord>((record) => record.customerId);

  async loadCart(customerId: string): Promise<CartSnapshot | null> {
    const record = this.store.get(customerId);
    return record ? CartMapper.fromStoreRecord(record) : null;
  }

  async saveCart(snapshot: CartSnapshot): Promise<void> {
    this.store.set(CartMapper.toStoreRecord(snapshot));
  }

  async deleteCart(customerId: string): Promise<void> {
    this.store.delete(customerId);
  }
}
