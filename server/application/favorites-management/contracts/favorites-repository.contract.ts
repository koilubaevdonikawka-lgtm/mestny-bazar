import type { FavoriteLink } from "@server/application/favorites-management/models/favorite-link.model";

/** Persists Customer ↔ Product links only — no product data. */
export interface IFavoritesRepository {
  add(customerId: string, productId: string): Promise<FavoriteLink>;
  remove(customerId: string, productId: string): Promise<boolean>;
  findByCustomerId(customerId: string): Promise<readonly FavoriteLink[]>;
  exists(customerId: string, productId: string): Promise<boolean>;
  count(customerId: string): Promise<number>;
  clear(customerId: string): Promise<number>;
}
