import type { FavoriteLink } from "@server/application/favorites-management/models/favorite-link.model";
import type {
  ClearFavoritesResult,
  FavoriteCheckResult,
  FavoritesCountResult,
  FavoritesListResult,
} from "@server/application/favorites-management/models/favorites-view.model";
import type { FavoritesManagementService } from "@server/application/favorites-management/services/favorites-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class AddProductToFavoritesUseCase {
  constructor(private readonly favorites: FavoritesManagementService) {}

  execute(customerId: string, productId: string): Promise<UseCaseResult<FavoriteLink>> {
    return this.favorites.addProduct(customerId, productId).then(useCaseResult);
  }
}

export class RemoveProductFromFavoritesUseCase {
  constructor(private readonly favorites: FavoritesManagementService) {}

  async execute(
    customerId: string,
    productId: string,
  ): Promise<UseCaseResult<{ removed: boolean }>> {
    const removed = await this.favorites.removeProduct(customerId, productId);
    return useCaseResult({ removed });
  }
}

export class GetFavoritesUseCase {
  constructor(private readonly favorites: FavoritesManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<FavoritesListResult>> {
    return this.favorites.getFavorites(customerId).then(useCaseResult);
  }
}

export class IsFavoriteUseCase {
  constructor(private readonly favorites: FavoritesManagementService) {}

  execute(customerId: string, productId: string): Promise<UseCaseResult<FavoriteCheckResult>> {
    return this.favorites.isFavorite(customerId, productId).then(useCaseResult);
  }
}

export class CountFavoritesUseCase {
  constructor(private readonly favorites: FavoritesManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<FavoritesCountResult>> {
    return this.favorites.countFavorites(customerId).then(useCaseResult);
  }
}

export class ClearFavoritesUseCase {
  constructor(private readonly favorites: FavoritesManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<ClearFavoritesResult>> {
    return this.favorites.clearFavorites(customerId).then(useCaseResult);
  }
}
