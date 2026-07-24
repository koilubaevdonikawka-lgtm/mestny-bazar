export type { IFavoritesRepository } from "./contracts/favorites-repository.contract";
export type { ICatalogFavoritesReader } from "./contracts/catalog-favorites-reader.contract";
export type { IFavoritesEventPublisher } from "./contracts/favorites-event-publisher.contract";
export type { IFavoritesAnalyticsProvider } from "./contracts/favorites-analytics-provider.contract";
export type { IFavoritesRecommendationProvider } from "./contracts/favorites-recommendation-provider.contract";
export type {
  IFavoritesRecommendationEngine,
  IFavoritesAnalyticsContext,
  IFavoritesNotificationProvider,
  IFavoritesExperienceEnricher,
} from "./contracts/favorites-extension-ports.contract";
export type { FavoriteLink } from "./models/favorite-link.model";
export type {
  FavoriteEntry,
  FavoritesListResult,
  FavoriteCheckResult,
  FavoritesCountResult,
  ClearFavoritesResult,
} from "./models/favorites-view.model";
export { createFavoriteLink } from "./models/favorite-link.model";
export { FavoritesManagementService } from "./services/favorites-management.service";
export { FavoritesManagementApplicationService } from "./services/favorites-management-application.service";
export {
  AddProductToFavoritesUseCase,
  RemoveProductFromFavoritesUseCase,
  GetFavoritesUseCase,
  IsFavoriteUseCase,
  CountFavoritesUseCase,
  ClearFavoritesUseCase,
} from "./use-cases/favorites-management.use-cases";
