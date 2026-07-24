import type { CatalogManagementApplicationService } from "@server/application/catalog-management/services/catalog-management-application.service";
import type { ICatalogFavoritesReader } from "@server/application/favorites-management/contracts/catalog-favorites-reader.contract";
import type { IFavoritesAnalyticsProvider } from "@server/application/favorites-management/contracts/favorites-analytics-provider.contract";
import type { IFavoritesEventPublisher } from "@server/application/favorites-management/contracts/favorites-event-publisher.contract";
import type { IFavoritesRecommendationProvider } from "@server/application/favorites-management/contracts/favorites-recommendation-provider.contract";
import type { IFavoritesRepository } from "@server/application/favorites-management/contracts/favorites-repository.contract";
import {
  AddProductToFavoritesUseCase,
  ClearFavoritesUseCase,
  CountFavoritesUseCase,
  FavoritesManagementApplicationService,
  FavoritesManagementService,
  GetFavoritesUseCase,
  IsFavoriteUseCase,
  RemoveProductFromFavoritesUseCase,
} from "@server/application/favorites-management";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CatalogFavoritesReaderAdapter } from "@server/infrastructure/favorites/catalog-favorites-reader.adapter";
import { DefaultFavoritesRecommendationProvider } from "@server/infrastructure/favorites/default-favorites-recommendation.provider";
import { FavoritesRepository } from "@server/infrastructure/favorites/favorites.repository";
import { NoopFavoritesAnalyticsProvider } from "@server/infrastructure/favorites/noop-favorites-analytics.provider";
import { NoopFavoritesEventPublisher } from "@server/infrastructure/favorites/noop-favorites-event.publisher";

/** Registers favorites management services and use cases. */
export function registerFavoritesManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.FavoritesRepository, () => new FavoritesRepository());

  registry.registerSingleton(InfrastructureTokens.CatalogFavoritesReader, (provider) =>
    new CatalogFavoritesReaderAdapter(
      provider.resolve<CatalogManagementApplicationService>(
        InfrastructureTokens.CatalogManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.FavoritesEventPublisher, () =>
    new NoopFavoritesEventPublisher(),
  );

  registry.registerSingleton(InfrastructureTokens.FavoritesAnalyticsProvider, () =>
    new NoopFavoritesAnalyticsProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.FavoritesRecommendationProvider, () =>
    new DefaultFavoritesRecommendationProvider(),
  );

  registry.registerTransient(InfrastructureTokens.FavoritesManagementService, (provider) =>
    new FavoritesManagementService(
      provider.resolve<IFavoritesRepository>(InfrastructureTokens.FavoritesRepository),
      provider.resolve<ICatalogFavoritesReader>(InfrastructureTokens.CatalogFavoritesReader),
      provider.resolve<IFavoritesEventPublisher>(InfrastructureTokens.FavoritesEventPublisher),
      provider.resolve<IFavoritesAnalyticsProvider>(
        InfrastructureTokens.FavoritesAnalyticsProvider,
      ),
      provider.resolve<IFavoritesRecommendationProvider>(
        InfrastructureTokens.FavoritesRecommendationProvider,
      ),
    ),
  );

  registry.registerTransient(InfrastructureTokens.AddProductToFavoritesUseCase, (provider) =>
    new AddProductToFavoritesUseCase(
      provider.resolve<FavoritesManagementService>(InfrastructureTokens.FavoritesManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.RemoveProductFromFavoritesUseCase, (provider) =>
    new RemoveProductFromFavoritesUseCase(
      provider.resolve<FavoritesManagementService>(InfrastructureTokens.FavoritesManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetFavoritesUseCase, (provider) =>
    new GetFavoritesUseCase(
      provider.resolve<FavoritesManagementService>(InfrastructureTokens.FavoritesManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.IsFavoriteUseCase, (provider) =>
    new IsFavoriteUseCase(
      provider.resolve<FavoritesManagementService>(InfrastructureTokens.FavoritesManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.CountFavoritesUseCase, (provider) =>
    new CountFavoritesUseCase(
      provider.resolve<FavoritesManagementService>(InfrastructureTokens.FavoritesManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.ClearFavoritesUseCase, (provider) =>
    new ClearFavoritesUseCase(
      provider.resolve<FavoritesManagementService>(InfrastructureTokens.FavoritesManagementService),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.FavoritesManagementApplicationService,
    (provider) =>
      new FavoritesManagementApplicationService(
        provider.resolve<AddProductToFavoritesUseCase>(
          InfrastructureTokens.AddProductToFavoritesUseCase,
        ),
        provider.resolve<RemoveProductFromFavoritesUseCase>(
          InfrastructureTokens.RemoveProductFromFavoritesUseCase,
        ),
        provider.resolve<GetFavoritesUseCase>(InfrastructureTokens.GetFavoritesUseCase),
        provider.resolve<IsFavoriteUseCase>(InfrastructureTokens.IsFavoriteUseCase),
        provider.resolve<CountFavoritesUseCase>(InfrastructureTokens.CountFavoritesUseCase),
        provider.resolve<ClearFavoritesUseCase>(InfrastructureTokens.ClearFavoritesUseCase),
      ),
  );
}
