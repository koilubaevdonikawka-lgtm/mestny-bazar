import {
  AddProductToFavoritesUseCase,
  ClearFavoritesUseCase,
  CountFavoritesUseCase,
  GetFavoritesUseCase,
  IsFavoriteUseCase,
  RemoveProductFromFavoritesUseCase,
} from "@server/application/favorites-management/use-cases/favorites-management.use-cases";

/** Application facade for favorites management scenario. */
export class FavoritesManagementApplicationService {
  constructor(
    private readonly addProductToFavoritesUseCase: AddProductToFavoritesUseCase,
    private readonly removeProductFromFavoritesUseCase: RemoveProductFromFavoritesUseCase,
    private readonly getFavoritesUseCase: GetFavoritesUseCase,
    private readonly isFavoriteUseCase: IsFavoriteUseCase,
    private readonly countFavoritesUseCase: CountFavoritesUseCase,
    private readonly clearFavoritesUseCase: ClearFavoritesUseCase,
  ) {}

  add(customerId: string, productId: string) {
    return this.addProductToFavoritesUseCase.execute(customerId, productId);
  }

  remove(customerId: string, productId: string) {
    return this.removeProductFromFavoritesUseCase.execute(customerId, productId);
  }

  list(customerId: string) {
    return this.getFavoritesUseCase.execute(customerId);
  }

  check(customerId: string, productId: string) {
    return this.isFavoriteUseCase.execute(customerId, productId);
  }

  count(customerId: string) {
    return this.countFavoritesUseCase.execute(customerId);
  }

  clear(customerId: string) {
    return this.clearFavoritesUseCase.execute(customerId);
  }
}
