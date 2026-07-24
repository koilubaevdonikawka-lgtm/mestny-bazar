import { ApiValidationError } from "@server/api/errors/api.errors";
import type { CartManagementApplicationService } from "@server/application/cart-management/services/cart-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readNumber,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Cart management HTTP controller. */
export class CartManagementController {
  constructor(private readonly cart: CartManagementApplicationService) {}

  async addItem(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const body = readRecordBody(context.body);
    const productId = readString(body.productId);
    if (!productId) {
      throw new ApiValidationError({ productId: ["productId is required"] });
    }

    const quantity = readNumber(body.quantity) ?? 1;
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiValidationError({ quantity: ["quantity must be a positive integer"] });
    }

    const result = await this.cart.addItem(customerId, productId, quantity);
    return createJsonResponse(context, result.value, 201);
  }

  async updateQuantity(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const productId = this.requireProductId(context);
    const body = readRecordBody(context.body);
    const quantity = readNumber(body.quantity);
    if (quantity === undefined || !Number.isInteger(quantity) || quantity < 0) {
      throw new ApiValidationError({ quantity: ["quantity must be a non-negative integer"] });
    }

    const result = await this.cart.updateQuantity(customerId, productId, quantity);
    return createJsonResponse(context, result.value);
  }

  async removeItem(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const productId = this.requireProductId(context);
    const result = await this.cart.removeItem(customerId, productId);
    return createJsonResponse(context, result.value);
  }

  async getCart(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const result = await this.cart.getCart(customerId);
    return createJsonResponse(context, result.value);
  }

  async calculateTotal(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const result = await this.cart.calculateTotal(customerId);
    return createJsonResponse(context, result.value);
  }

  async validate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const result = await this.cart.validate(customerId);
    return createJsonResponse(context, result.value);
  }

  async clear(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const result = await this.cart.clear(customerId);
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
