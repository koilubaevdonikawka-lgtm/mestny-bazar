import { ApiValidationError } from "@server/api/errors/api.errors";
import type { OrderManagementApplicationService } from "@server/application/order-management/services/order-management-application.service";
import {
  isOrderManagementStatus,
  OrderManagementStatus,
} from "@server/application/order-management";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Order management HTTP controller — lifecycle only, no payment. */
export class OrderManagementController {
  constructor(private readonly orders: OrderManagementApplicationService) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const body = readRecordBody(context.body);
    const checkoutId = readString(body.checkoutId);
    if (!checkoutId) {
      throw new ApiValidationError({ checkoutId: ["checkoutId is required"] });
    }

    const result = await this.orders.createOrder(customerId, checkoutId);
    return createJsonResponse(context, result.value, 201);
  }

  async getById(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const result = await this.orders.getOrder(orderId);
    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }
    return createJsonResponse(context, result.value);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const result = await this.orders.getCustomerOrders(customerId);
    return createJsonResponse(context, result.value);
  }

  async updateStatus(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const body = readRecordBody(context.body);
    const statusRaw = readString(body.status);
    if (!statusRaw || !isOrderManagementStatus(statusRaw)) {
      throw new ApiValidationError({
        status: [`status must be one of: ${Object.values(OrderManagementStatus).join(", ")}`],
      });
    }

    const result = await this.orders.updateStatus(
      orderId,
      statusRaw,
      readString(body.actor),
      readString(body.reason),
    );
    return createJsonResponse(context, result.value);
  }

  async cancel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const orderId = this.requireOrderId(context);
    const body = readRecordBody(context.body);
    const result = await this.orders.cancel(orderId, customerId, readString(body.reason));
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const result = await this.orders.getHistory(orderId);
    return createJsonResponse(context, result.value);
  }

  private requireOrderId(context: ApiRequestContext): string {
    const orderId = readString(context.params.orderId);
    if (!orderId) {
      throw new ApiValidationError({ orderId: ["orderId is required"] });
    }
    return orderId;
  }
}
