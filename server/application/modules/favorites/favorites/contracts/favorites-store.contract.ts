import type { FavoriteItem } from "@server/application/modules/favorites/favorites/models";

/** Favorites persistence contract — implemented by infrastructure adapters. */
export interface IFavoritesStore {
  loadFavorites(userId: string): Promise<readonly FavoriteItem[]>;
  saveFavorites(userId: string, items: readonly FavoriteItem[]): Promise<void>;
  removeFavorite(userId: string, productId: string): Promise<boolean>;
}
