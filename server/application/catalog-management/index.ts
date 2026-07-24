export type { ICatalogProductReader } from "./contracts/catalog-product-reader.contract";
export type { ICatalogRecommendationProvider } from "./contracts/catalog-recommendation-provider.contract";
export type { ICatalogPopularityProvider } from "./contracts/catalog-popularity-provider.contract";
export type {
  ICatalogSearchProvider,
  ICatalogExperienceEnricher,
  ICatalogAnalyticsContext,
  ICatalogLoyaltyContext,
  ICatalogPersonalizationEngine,
} from "./contracts/catalog-extension-ports.contract";
export type {
  CatalogListQuery,
  CatalogRecommendationContext,
} from "./dto/catalog-query.dto";
export { DEFAULT_CATALOG_LIMIT, MAX_CATALOG_LIMIT, normalizeCatalogListQuery } from "./dto/catalog-query.dto";
export type {
  CatalogProductCard,
  CatalogProductDetails,
  CatalogProductAvailability,
  CatalogProductListResult,
} from "./models/catalog-product.model";
export { CatalogManagementService } from "./services/catalog-management.service";
export { CatalogManagementApplicationService } from "./services/catalog-management-application.service";
export {
  GetCatalogProductsUseCase,
  GetProductDetailsUseCase,
  GetProductsByCategoryUseCase,
  GetProductsBySellerUseCase,
  GetPopularProductsUseCase,
  GetNewestProductsUseCase,
  GetRecommendedProductsUseCase,
  GetRelatedProductsUseCase,
  CheckProductAvailabilityUseCase,
} from "./use-cases/catalog-management.use-cases";
