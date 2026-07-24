import { ApiValidationError } from "@server/api/errors/api.errors";
import type { OrderModule } from "@server/application/modules/order/order/api/order.module";
import type { PurchaseApplicationService } from "@server/application/purchase/services/purchase-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readNumber,
  readQueryString,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";
import type { SearchFilters } from "@server/application/modules/search/search/dto";
import { toNotifyOrderInput } from "@server/application/purchase/dto";

/** Purchase HTTP controller — delegates to PurchaseApplicationService use cases. */
export class PurchaseController {
  constructor(
    private readonly purchase: PurchaseApplicationService,
    private readonly orders: OrderModule,
  ) {}

  async browseCatalog(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.purchase.browseCatalog(readSearchFilters(context));
    return createJsonResponse(context, result.value);
  }

  async viewProduct(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = context.params.id;
    if (!productId?.trim()) {
      throw new ApiValidationError({ id: ["Product id is required"] });
    }

    const result = await this.purchase.viewProduct(productId);
    return createJsonResponse(context, result.value);
  }

  async addToCart(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const customerId = resolveCustomerId(context, body);
    const productId = readString(body.productId);

    if (!productId) {
      throw new ApiValidationError({ productId: ["productId is required"] });
    }

    const result = await this.purchase.addToCart({
      customerId,
      productId,
      quantity: readNumber(body.quantity),
      catalogId: readString(body.catalogId),
    });

    return createJsonResponse(context, result.value, 201);
  }

  async updateCart(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.purchase.updateCart({ customerId, productId, quantity });
    return createJsonResponse(context, result.value);
  }

  async checkout(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const customerId = resolveCustomerId(context, body);
    const paymentMethod = readString(body.paymentMethod);
    const deliveryMethod = readString(body.deliveryMethod);

    if (!paymentMethod) {
      throw new ApiValidationError({ paymentMethod: ["paymentMethod is required"] });
    }
    if (!deliveryMethod) {
      throw new ApiValidationError({ deliveryMethod: ["deliveryMethod is required"] });
    }

    const result = await this.purchase.checkout({
      customerId,
      paymentMethod,
      deliveryMethod,
      comment: readString(body.comment) ?? null,
    });

    return createJsonResponse(context, result.value, 201);
  }

  async createOrder(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sessionId = context.params.id;
    if (!sessionId?.trim()) {
      throw new ApiValidationError({ id: ["Checkout session id is required"] });
    }

    const result = await this.purchase.createOrder(sessionId);
    return createJsonResponse(context, result.value, 201);
  }

  async payOrder(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const paymentId = readString(body.paymentId) ?? context.params.id;

    if (!paymentId?.trim()) {
      throw new ApiValidationError({ paymentId: ["paymentId is required"] });
    }

    const result = await this.purchase.payOrder({
      paymentId,
      confirmCash: body.confirmCash !== false,
    });

    return createJsonResponse(context, result.value);
  }

  async completePurchase(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sessionId = context.params.id;
    if (!sessionId?.trim()) {
      throw new ApiValidationError({ id: ["Checkout session id is required"] });
    }

    const body = readRecordBody(context.body);
    const result = await this.purchase.completePurchase({
      sessionId,
      confirmCash: body.confirmCash !== false,
    });

    return createJsonResponse(context, result, 201);
  }

  async notifyWarehouse(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const order = await this.requireOrder(context.params.id);
    const result = await this.purchase.notifyWarehouse(toNotifyOrderInput(order));
    return createJsonResponse(context, result.value);
  }

  async notifyCourier(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const order = await this.requireOrder(context.params.id);
    const result = await this.purchase.notifyCourier(toNotifyOrderInput(order));
    return createJsonResponse(context, result.value);
  }

  private async requireOrder(orderId: string | undefined) {
    if (!orderId?.trim()) {
      throw new ApiValidationError({ id: ["Order id is required"] });
    }

    const order = await this.orders.getOrder(orderId);
    if (!order) {
      throw new ApiValidationError({ id: ["Order not found"] });
    }

    return order;
  }
}

function readSearchFilters(context: ApiRequestContext): SearchFilters {
  const query = context.query;
  return Object.freeze({
    query: readQueryString(query, "q") ?? readQueryString(query, "query"),
    sellerId: readQueryString(query, "sellerId"),
    catalogId: readQueryString(query, "catalogId"),
    categoryId: readQueryString(query, "categoryId"),
    minPrice: readNumber(readQueryString(query, "minPrice")),
    maxPrice: readNumber(readQueryString(query, "maxPrice")),
    limit: readNumber(readQueryString(query, "limit")),
  });
}
