import type { IFavoritesRepository } from "@server/application/favorites-management/contracts/favorites-repository.contract";
import {
  createFavoriteLink,
  type FavoriteLink,
} from "@server/application/favorites-management/models/favorite-link.model";

/** In-memory Customer ↔ Product link store. */
export class FavoritesRepository implements IFavoritesRepository {
  private readonly linksByCustomer = new Map<string, Map<string, FavoriteLink>>();

  async add(customerId: string, productId: string): Promise<FavoriteLink> {
    const normalizedCustomerId = customerId.trim();
    const normalizedProductId = productId.trim();
    const link = createFavoriteLink(normalizedCustomerId, normalizedProductId);
    const customerLinks = this.linksByCustomer.get(normalizedCustomerId) ?? new Map();
    customerLinks.set(normalizedProductId, link);
    this.linksByCustomer.set(normalizedCustomerId, customerLinks);
    return link;
  }

  async remove(customerId: string, productId: string): Promise<boolean> {
    const customerLinks = this.linksByCustomer.get(customerId.trim());
    if (!customerLinks) {
      return false;
    }
    return customerLinks.delete(productId.trim());
  }

  async findByCustomerId(customerId: string): Promise<readonly FavoriteLink[]> {
    const customerLinks = this.linksByCustomer.get(customerId.trim());
    if (!customerLinks) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...customerLinks.values()].sort((left, right) =>
        right.addedAt.localeCompare(left.addedAt),
      ),
    );
  }

  async exists(customerId: string, productId: string): Promise<boolean> {
    const customerLinks = this.linksByCustomer.get(customerId.trim());
    return customerLinks?.has(productId.trim()) ?? false;
  }

  async count(customerId: string): Promise<number> {
    const customerLinks = this.linksByCustomer.get(customerId.trim());
    return customerLinks?.size ?? 0;
  }

  async clear(customerId: string): Promise<number> {
    const normalizedCustomerId = customerId.trim();
    const customerLinks = this.linksByCustomer.get(normalizedCustomerId);
    if (!customerLinks) {
      return 0;
    }
    const removed = customerLinks.size;
    this.linksByCustomer.delete(normalizedCustomerId);
    return removed;
  }
}
