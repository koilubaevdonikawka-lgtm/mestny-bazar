import { ApiValidationError } from "@server/api/errors/api.errors";
import type { FavoritesModule } from "@server/application/modules/favorites";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Favorites HTTP controller — delegates to FavoritesModule. */
export class FavoritesController {
  constructor(private readonly favorites: FavoritesModule) {}

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const userId = resolveCustomerId(context);
    const items = await this.favorites.listFavorites(userId);
    return createJsonResponse(context, items);
  }

  async add(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const userId = resolveCustomerId(context, body);
    const productId = readString(body.productId);

    if (!productId) {
      throw new ApiValidationError({ productId: ["productId is required"] });
    }

    const item = await this.favorites.addFavorite({ userId, productId });
    return createJsonResponse(context, item, 201);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const userId = resolveCustomerId(context);
    const productId = context.params.productId;

    if (!productId?.trim()) {
      throw new ApiValidationError({ productId: ["productId is required"] });
    }

    const removed = await this.favorites.removeFavorite(userId, productId);
    return createJsonResponse(context, { productId, removed });
  }
}
