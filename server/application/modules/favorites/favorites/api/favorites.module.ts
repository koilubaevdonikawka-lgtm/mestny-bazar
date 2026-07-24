import type { AddFavoriteDto } from "@server/application/modules/favorites/favorites/dto";
import type { FavoriteItem } from "@server/application/modules/favorites/favorites/models";
import type { FavoritesService } from "@server/application/modules/favorites/favorites/services";

/** Public entry point for the Favorites business capability module. */
export class FavoritesModule {
  constructor(private readonly service: FavoritesService) {}

  listFavorites(userId: string): Promise<readonly FavoriteItem[]> {
    return this.service.listFavorites(userId);
  }

  addFavorite(input: AddFavoriteDto): Promise<FavoriteItem> {
    return this.service.addFavorite(input);
  }

  removeFavorite(userId: string, productId: string): Promise<boolean> {
    return this.service.removeFavorite(userId, productId);
  }

  isFavorite(userId: string, productId: string): Promise<boolean> {
    return this.service.isFavorite(userId, productId);
  }
}
