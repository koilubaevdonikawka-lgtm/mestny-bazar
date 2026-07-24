import { ApiValidationError } from "@server/api/errors/api.errors";
import type { CatalogManagementApplicationService } from "@server/application/catalog-management/services/catalog-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readNumber,
  readQueryString,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Catalog management HTTP controller — read-only buyer catalog. */
export class CatalogManagementController {
  constructor(private readonly catalog: CatalogManagementApplicationService) {}

  async listProducts(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.catalog.listProducts(readListQuery(context));
    return createJsonResponse(context, result.value);
  }

  async getProductDetails(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireParam(context, "id");
    const result = await this.catalog.getProductDetails(productId);
    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }
    return createJsonResponse(context, result.value);
  }

  async getProductsByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const categoryId = this.requireParam(context, "categoryId");
    const result = await this.catalog.getProductsByCategory(categoryId, readListQuery(context));
    return createJsonResponse(context, result.value);
  }

  async getProductsBySeller(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sellerId = this.requireParam(context, "sellerId");
    const result = await this.catalog.getProductsBySeller(sellerId, readListQuery(context));
    return createJsonResponse(context, result.value);
  }

  async getPopularProducts(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.catalog.getPopularProducts(readListQuery(context));
    return createJsonResponse(context, result.value);
  }

  async getNewestProducts(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.catalog.getNewestProducts(readListQuery(context));
    return createJsonResponse(context, result.value);
  }

  async getRecommendedProducts(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = readQueryString(context.query, "customerId");
    const sessionId = readQueryString(context.query, "sessionId");
    const result = await this.catalog.getRecommendedProducts(readListQuery(context), {
      customerId,
      sessionId,
    });
    return createJsonResponse(context, result.value);
  }

  async getRelatedProducts(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireParam(context, "productId");
    const result = await this.catalog.getRelatedProducts(productId, readListQuery(context));
    return createJsonResponse(context, result.value);
  }

  async checkAvailability(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = this.requireParam(context, "id");
    const result = await this.catalog.checkAvailability(productId);
    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }
    return createJsonResponse(context, result.value);
  }

  private requireParam(context: ApiRequestContext, name: string): string {
    const value = readString(context.params[name]);
    if (!value) {
      throw new ApiValidationError({ [name]: [`${name} is required`] });
    }
    return value;
  }
}

function readListQuery(context: ApiRequestContext) {
  return {
    limit: readNumber(readQueryString(context.query, "limit")),
    offset: readNumber(readQueryString(context.query, "offset")),
  };
}
