import type { ICatalogPopularityProvider } from "@server/application/catalog-management/contracts/catalog-popularity-provider.contract";
import type { ICatalogProductReader } from "@server/application/catalog-management/contracts/catalog-product-reader.contract";
import type { ICatalogRecommendationProvider } from "@server/application/catalog-management/contracts/catalog-recommendation-provider.contract";
import type { MarketplaceModule, ProductModule } from "@server/application/modules";
import {
  CatalogManagementApplicationService,
  CatalogManagementService,
  CheckProductAvailabilityUseCase,
  GetCatalogProductsUseCase,
  GetNewestProductsUseCase,
  GetPopularProductsUseCase,
  GetProductDetailsUseCase,
  GetProductsByCategoryUseCase,
  GetProductsBySellerUseCase,
  GetRecommendedProductsUseCase,
  GetRelatedProductsUseCase,
} from "@server/application/catalog-management";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CatalogProductReader } from "@server/infrastructure/catalog/catalog-product.reader";
import { DefaultCatalogPopularityProvider } from "@server/infrastructure/catalog/default-catalog-popularity.provider";
import { DefaultCatalogRecommendationProvider } from "@server/infrastructure/catalog/default-catalog-recommendation.provider";

/** Registers catalog management services and use cases (read-only buyer catalog). */
export function registerCatalogManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.CatalogProductReader, (provider) =>
    new CatalogProductReader(
      provider.resolve(InfrastructureTokens.ProductStore),
      provider.resolve<MarketplaceModule>(BootstrapTokens.MarketplaceModule),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.CatalogRecommendationProvider, () =>
    new DefaultCatalogRecommendationProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.CatalogPopularityProvider, () =>
    new DefaultCatalogPopularityProvider(),
  );

  registry.registerTransient(InfrastructureTokens.CatalogManagementService, (provider) =>
    new CatalogManagementService(
      provider.resolve<ProductModule>(BootstrapTokens.ProductModule),
      provider.resolve<MarketplaceModule>(BootstrapTokens.MarketplaceModule),
      provider.resolve<ICatalogProductReader>(InfrastructureTokens.CatalogProductReader),
      provider.resolve<ICatalogRecommendationProvider>(
        InfrastructureTokens.CatalogRecommendationProvider,
      ),
      provider.resolve<ICatalogPopularityProvider>(InfrastructureTokens.CatalogPopularityProvider),
    ),
  );

  registry.registerTransient(InfrastructureTokens.GetCatalogProductsUseCase, (provider) =>
    new GetCatalogProductsUseCase(
      provider.resolve<CatalogManagementService>(InfrastructureTokens.CatalogManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetProductDetailsUseCase, (provider) =>
    new GetProductDetailsUseCase(
      provider.resolve<CatalogManagementService>(InfrastructureTokens.CatalogManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetProductsByCategoryUseCase, (provider) =>
    new GetProductsByCategoryUseCase(
      provider.resolve<CatalogManagementService>(InfrastructureTokens.CatalogManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetProductsBySellerUseCase, (provider) =>
    new GetProductsBySellerUseCase(
      provider.resolve<CatalogManagementService>(InfrastructureTokens.CatalogManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetPopularProductsUseCase, (provider) =>
    new GetPopularProductsUseCase(
      provider.resolve<CatalogManagementService>(InfrastructureTokens.CatalogManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetNewestProductsUseCase, (provider) =>
    new GetNewestProductsUseCase(
      provider.resolve<CatalogManagementService>(InfrastructureTokens.CatalogManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetRecommendedProductsUseCase, (provider) =>
    new GetRecommendedProductsUseCase(
      provider.resolve<CatalogManagementService>(InfrastructureTokens.CatalogManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetRelatedProductsUseCase, (provider) =>
    new GetRelatedProductsUseCase(
      provider.resolve<CatalogManagementService>(InfrastructureTokens.CatalogManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.CheckProductAvailabilityUseCase, (provider) =>
    new CheckProductAvailabilityUseCase(
      provider.resolve<CatalogManagementService>(InfrastructureTokens.CatalogManagementService),
    ),
  );

  registry.registerTransient(InfrastructureTokens.CatalogManagementApplicationService, (provider) =>
    new CatalogManagementApplicationService(
      provider.resolve<GetCatalogProductsUseCase>(InfrastructureTokens.GetCatalogProductsUseCase),
      provider.resolve<GetProductDetailsUseCase>(InfrastructureTokens.GetProductDetailsUseCase),
      provider.resolve<GetProductsByCategoryUseCase>(
        InfrastructureTokens.GetProductsByCategoryUseCase,
      ),
      provider.resolve<GetProductsBySellerUseCase>(
        InfrastructureTokens.GetProductsBySellerUseCase,
      ),
      provider.resolve<GetPopularProductsUseCase>(InfrastructureTokens.GetPopularProductsUseCase),
      provider.resolve<GetNewestProductsUseCase>(InfrastructureTokens.GetNewestProductsUseCase),
      provider.resolve<GetRecommendedProductsUseCase>(
        InfrastructureTokens.GetRecommendedProductsUseCase,
      ),
      provider.resolve<GetRelatedProductsUseCase>(InfrastructureTokens.GetRelatedProductsUseCase),
      provider.resolve<CheckProductAvailabilityUseCase>(
        InfrastructureTokens.CheckProductAvailabilityUseCase,
      ),
    ),
  );
}
