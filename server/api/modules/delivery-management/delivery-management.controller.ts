import { ApiValidationError } from "@server/api/errors/api.errors";
import type { DeliveryManagementApplicationService } from "@server/application/delivery-management/services/delivery-management-application.service";
import {
  DeliveryStatus,
  isDeliveryStatus,
} from "@server/application/delivery-management";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Delivery management HTTP controller — delivery lifecycle only. */
export class DeliveryManagementController {
  constructor(private readonly deliveries: DeliveryManagementApplicationService) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const orderId = readString(body.orderId);
    if (!orderId) {
      throw new ApiValidationError({ orderId: ["orderId is required"] });
    }

    const result = await this.deliveries.createDelivery(orderId);
    return createJsonResponse(context, result.value, 201);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const result = await this.deliveries.getDeliveries(customerId);
    return createJsonResponse(context, result.value);
  }

  async getById(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const deliveryId = this.requireDeliveryId(context);
    const result = await this.deliveries.getDelivery(deliveryId);
    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }
    return createJsonResponse(context, result.value);
  }

  async assignCourier(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const deliveryId = this.requireDeliveryId(context);
    const body = readRecordBody(context.body);
    const courierId = readString(body.courierId);
    if (!courierId) {
      throw new ApiValidationError({ courierId: ["courierId is required"] });
    }

    const result = await this.deliveries.assignCourier(deliveryId, courierId);
    return createJsonResponse(context, result.value);
  }

  async updateStatus(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const deliveryId = this.requireDeliveryId(context);
    const body = readRecordBody(context.body);
    const statusRaw = readString(body.status);
    if (!statusRaw || !isDeliveryStatus(statusRaw)) {
      throw new ApiValidationError({
        status: [`status must be one of: ${Object.values(DeliveryStatus).join(", ")}`],
      });
    }

    const result = await this.deliveries.updateStatus(
      deliveryId,
      statusRaw,
      readString(body.actor),
      readString(body.reason),
    );
    return createJsonResponse(context, result.value);
  }

  async cancel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const deliveryId = this.requireDeliveryId(context);
    const body = readRecordBody(context.body);
    const result = await this.deliveries.cancelDelivery(deliveryId, readString(body.reason));
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const deliveryId = this.requireDeliveryId(context);
    const result = await this.deliveries.getHistory(deliveryId);
    return createJsonResponse(context, result.value);
  }

  private requireDeliveryId(context: ApiRequestContext): string {
    const deliveryId = readString(context.params.deliveryId);
    if (!deliveryId) {
      throw new ApiValidationError({ deliveryId: ["deliveryId is required"] });
    }
    return deliveryId;
  }
}
