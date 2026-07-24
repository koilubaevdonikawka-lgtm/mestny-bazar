import type {
  CatalogListQuery,
  CatalogRecommendationContext,
} from "@server/application/catalog-management/dto/catalog-query.dto";
import type {
  CatalogProductAvailability,
  CatalogProductDetails,
  CatalogProductListResult,
} from "@server/application/catalog-management/models/catalog-product.model";
import type { CatalogManagementService } from "@server/application/catalog-management/services/catalog-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class GetCatalogProductsUseCase {
  constructor(private readonly catalog: CatalogManagementService) {}

  execute(query: CatalogListQuery = {}): Promise<UseCaseResult<CatalogProductListResult>> {
    return this.catalog.listProducts(query).then(useCaseResult);
  }
}

export class GetProductDetailsUseCase {
  constructor(private readonly catalog: CatalogManagementService) {}

  async execute(productId: string): Promise<UseCaseResult<CatalogProductDetails | null>> {
    return useCaseResult(await this.catalog.getProductDetails(productId));
  }
}

export class GetProductsByCategoryUseCase {
  constructor(private readonly catalog: CatalogManagementService) {}

  execute(
    categoryId: string,
    query: CatalogListQuery = {},
  ): Promise<UseCaseResult<CatalogProductListResult>> {
    return this.catalog.getProductsByCategory(categoryId, query).then(useCaseResult);
  }
}

export class GetProductsBySellerUseCase {
  constructor(private readonly catalog: CatalogManagementService) {}

  execute(
    sellerId: string,
    query: CatalogListQuery = {},
  ): Promise<UseCaseResult<CatalogProductListResult>> {
    return this.catalog.getProductsBySeller(sellerId, query).then(useCaseResult);
  }
}

export class GetPopularProductsUseCase {
  constructor(private readonly catalog: CatalogManagementService) {}

  execute(query: CatalogListQuery = {}): Promise<UseCaseResult<CatalogProductListResult>> {
    return this.catalog.getPopularProducts(query).then(useCaseResult);
  }
}

export class GetNewestProductsUseCase {
  constructor(private readonly catalog: CatalogManagementService) {}

  execute(query: CatalogListQuery = {}): Promise<UseCaseResult<CatalogProductListResult>> {
    return this.catalog.getNewestProducts(query).then(useCaseResult);
  }
}

export class GetRecommendedProductsUseCase {
  constructor(private readonly catalog: CatalogManagementService) {}

  execute(
    query: CatalogListQuery = {},
    context: CatalogRecommendationContext = {},
  ): Promise<UseCaseResult<CatalogProductListResult>> {
    return this.catalog.getRecommendedProducts(query, context).then(useCaseResult);
  }
}

export class GetRelatedProductsUseCase {
  constructor(private readonly catalog: CatalogManagementService) {}

  execute(
    productId: string,
    query: CatalogListQuery = {},
  ): Promise<UseCaseResult<CatalogProductListResult>> {
    return this.catalog.getRelatedProducts(productId, query).then(useCaseResult);
  }
}

export class CheckProductAvailabilityUseCase {
  constructor(private readonly catalog: CatalogManagementService) {}

  async execute(productId: string): Promise<UseCaseResult<CatalogProductAvailability | null>> {
    return useCaseResult(await this.catalog.checkAvailability(productId));
  }
}
