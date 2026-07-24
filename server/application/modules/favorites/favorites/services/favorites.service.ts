import type { IFavoritesStore } from "@server/application/modules/favorites/favorites/contracts";
import type { AddFavoriteDto } from "@server/application/modules/favorites/favorites/dto";
import {
  createFavoriteItem,
  type FavoriteItem,
} from "@server/application/modules/favorites/favorites/models";
import type { IProductRepository } from "@server/application/ports";

/** Favorites business capability service — orchestrates wishlist operations via IFavoritesStore. */
export class FavoritesService {
  constructor(
    private readonly store: IFavoritesStore,
    private readonly products?: IProductRepository,
  ) {}

  async addFavorite(input: AddFavoriteDto): Promise<FavoriteItem> {
    const product = await this.products?.findSnapshotById(input.productId);
    if (this.products && !product) {
      throw new Error(`Product not found: ${input.productId}`);
    }

    const item = createFavoriteItem({
      userId: input.userId,
      productId: input.productId,
      sellerId: product?.sellerId ?? "unknown-seller",
    });

    const items = (await this.store.loadFavorites(input.userId)).filter(
      (favorite) => favorite.productId !== input.productId,
    );
    await this.store.saveFavorites(input.userId, sortFavorites([...items, item]));
    return item;
  }

  async removeFavorite(userId: string, productId: string): Promise<boolean> {
    return this.store.removeFavorite(userId, productId);
  }

  async listFavorites(userId: string): Promise<readonly FavoriteItem[]> {
    return sortFavorites(await this.store.loadFavorites(userId));
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const items = await this.store.loadFavorites(userId);
    return items.some((item) => item.productId === productId);
  }
}

function sortFavorites(items: readonly FavoriteItem[]): readonly FavoriteItem[] {
  return Object.freeze([...items].sort((left, right) => right.addedAt.localeCompare(left.addedAt)));
}
