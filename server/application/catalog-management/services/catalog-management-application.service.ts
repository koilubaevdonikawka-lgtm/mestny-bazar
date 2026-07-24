import type {
  CatalogListQuery,
  CatalogRecommendationContext,
} from "@server/application/catalog-management/dto/catalog-query.dto";
import {
  CheckProductAvailabilityUseCase,
  GetCatalogProductsUseCase,
  GetNewestProductsUseCase,
  GetPopularProductsUseCase,
  GetProductDetailsUseCase,
  GetProductsByCategoryUseCase,
  GetProductsBySellerUseCase,
  GetRecommendedProductsUseCase,
  GetRelatedProductsUseCase,
} from "@server/application/catalog-management/use-cases/catalog-management.use-cases";

/** Application facade for catalog management (buyer-facing read-only catalog). */
export class CatalogManagementApplicationService {
  constructor(
    private readonly getCatalogProductsUseCase: GetCatalogProductsUseCase,
    private readonly getProductDetailsUseCase: GetProductDetailsUseCase,
    private readonly getProductsByCategoryUseCase: GetProductsByCategoryUseCase,
    private readonly getProductsBySellerUseCase: GetProductsBySellerUseCase,
    private readonly getPopularProductsUseCase: GetPopularProductsUseCase,
    private readonly getNewestProductsUseCase: GetNewestProductsUseCase,
    private readonly getRecommendedProductsUseCase: GetRecommendedProductsUseCase,
    private readonly getRelatedProductsUseCase: GetRelatedProductsUseCase,
    private readonly checkProductAvailabilityUseCase: CheckProductAvailabilityUseCase,
  ) {}

  listProducts(query: CatalogListQuery = {}) {
    return this.getCatalogProductsUseCase.execute(query);
  }

  getProductDetails(productId: string) {
    return this.getProductDetailsUseCase.execute(productId);
  }

  getProductsByCategory(categoryId: string, query: CatalogListQuery = {}) {
    return this.getProductsByCategoryUseCase.execute(categoryId, query);
  }

  getProductsBySeller(sellerId: string, query: CatalogListQuery = {}) {
    return this.getProductsBySellerUseCase.execute(sellerId, query);
  }

  getPopularProducts(query: CatalogListQuery = {}) {
    return this.getPopularProductsUseCase.execute(query);
  }

  getNewestProducts(query: CatalogListQuery = {}) {
    return this.getNewestProductsUseCase.execute(query);
  }

  getRecommendedProducts(query: CatalogListQuery = {}, context: CatalogRecommendationContext = {}) {
    return this.getRecommendedProductsUseCase.execute(query, context);
  }

  getRelatedProducts(productId: string, query: CatalogListQuery = {}) {
    return this.getRelatedProductsUseCase.execute(productId, query);
  }

  checkAvailability(productId: string) {
    return this.checkProductAvailabilityUseCase.execute(productId);
  }
}
