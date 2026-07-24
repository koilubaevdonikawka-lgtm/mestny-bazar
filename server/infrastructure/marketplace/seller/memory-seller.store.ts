import type { ISellerStore } from "@server/application/modules/seller/seller/contracts";
import type { Seller } from "@server/application/modules/seller/seller/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory seller store for development and tests. */
export class MemorySellerStore implements ISellerStore {
  private readonly sellers = new InMemoryStore<Seller>((seller) => seller.id);

  async saveSeller(seller: Seller): Promise<void> {
    this.sellers.set(seller);
  }

  async updateSeller(seller: Seller): Promise<void> {
    if (!this.sellers.has(seller.id)) {
      throw new Error(`Seller not found: ${seller.id}`);
    }
    this.sellers.set(seller);
  }

  async findSellerById(sellerId: string): Promise<Seller | null> {
    return this.sellers.get(sellerId) ?? null;
  }
}
