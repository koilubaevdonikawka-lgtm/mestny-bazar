import type { IFavoritesStore } from "@server/application/modules/favorites/favorites/contracts";
import type { FavoriteItem } from "@server/application/modules/favorites/favorites/models";
import { FavoritesMapper } from "@server/infrastructure/marketplace/mappers";
import type { FavoritesStoreRecord } from "@server/infrastructure/marketplace/shared";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory favorites store for development and tests. */
export class MemoryFavoritesStore implements IFavoritesStore {
  private readonly store = new InMemoryStore<FavoritesStoreRecord>((record) => record.userId);

  async loadFavorites(userId: string): Promise<readonly FavoriteItem[]> {
    const record = this.store.get(userId);
    return record ? FavoritesMapper.fromStoreRecord(record) : Object.freeze([]);
  }

  async saveFavorites(userId: string, items: readonly FavoriteItem[]): Promise<void> {
    this.store.set(FavoritesMapper.toStoreRecord(userId, items));
  }

  async removeFavorite(userId: string, productId: string): Promise<boolean> {
    const record = this.store.get(userId);
    if (!record) {
      return false;
    }

    const items = record.items.filter((item) => item.productId !== productId);
    if (items.length === record.items.length) {
      return false;
    }

    this.store.set(FavoritesMapper.toStoreRecord(userId, items));
    return true;
  }
}
