import { ApiValidationError } from "@server/api/errors/api.errors";
import type { CartModule } from "@server/application/modules/cart";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readNumber,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Cart HTTP controller — delegates to CartModule. */
export class CartController {
  constructor(private readonly cart: CartModule) {}

  async getCart(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const snapshot = await this.cart.getCart(customerId);
    return createJsonResponse(context, snapshot);
  }

  async addItem(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const customerId = resolveCustomerId(context, body);
    const productId = readString(body.productId);

    if (!productId) {
      throw new ApiValidationError({ productId: ["productId is required"] });
    }

    const snapshot = await this.cart.addItem({
      customerId,
      productId,
      quantity: readNumber(body.quantity),
      catalogId: readString(body.catalogId),
    });

    return createJsonResponse(context, snapshot, 201);
  }

  async changeQuantity(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const customerId = resolveCustomerId(context, body);
    const productId = context.params.id;
    const quantity = readNumber(body.quantity);

    if (!productId?.trim()) {
      throw new ApiValidationError({ id: ["Product id is required"] });
    }
    if (quantity === undefined) {
      throw new ApiValidationError({ quantity: ["quantity is required"] });
    }

    const snapshot = await this.cart.changeQuantity(customerId, productId, quantity);
    return createJsonResponse(context, snapshot);
  }

  async removeItem(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const productId = context.params.id;

    if (!productId?.trim()) {
      throw new ApiValidationError({ id: ["Product id is required"] });
    }

    const snapshot = await this.cart.removeItem(customerId, productId);
    return createJsonResponse(context, snapshot);
  }

  async clearCart(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const snapshot = await this.cart.clearCart(customerId);
    return createJsonResponse(context, snapshot);
  }
}
