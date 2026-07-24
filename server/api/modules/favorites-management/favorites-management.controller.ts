import { ApiValidationError } from "@server/api/errors/api.errors";
import type { FavoritesManagementApplicationService } from "@server/application/favorites-management/services/favorites-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Favorites management HTTP controller. */
export class FavoritesManagementController {
  constructor(private readonly favorites: FavoritesManagementApplicationService) {}

  async add(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const productId = this.requireProductId(context);
    const result = await this.favorites.add(customerId, productId);
    return createJsonResponse(context, result.value, 201);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const productId = this.requireProductId(context);
    const result = await this.favorites.remove(customerId, productId);
    return createJsonResponse(context, result.value);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const result = await this.favorites.list(customerId);
    return createJsonResponse(context, result.value);
  }

  async check(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const productId = this.requireProductId(context);
    const result = await this.favorites.check(customerId, productId);
    return createJsonResponse(context, result.value);
  }

  async count(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const result = await this.favorites.count(customerId);
    return createJsonResponse(context, result.value);
  }

  async clear(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const result = await this.favorites.clear(customerId);
    return createJsonResponse(context, result.value);
  }

  private requireProductId(context: ApiRequestContext): string {
    const productId = readString(context.params.productId);
    if (!productId) {
      throw new ApiValidationError({ productId: ["productId is required"] });
    }
    return productId;
  }
}
