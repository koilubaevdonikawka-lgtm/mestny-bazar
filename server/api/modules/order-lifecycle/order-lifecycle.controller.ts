import { ApiValidationError } from "@server/api/errors/api.errors";
import type { OrderLifecycleApplicationService } from "@server/application/order-lifecycle/services/order-lifecycle-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Order lifecycle HTTP controller — delegates to OrderLifecycleApplicationService. */
export class OrderLifecycleController {
  constructor(private readonly lifecycle: OrderLifecycleApplicationService) {}

  async assignCourier(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const body = readRecordBody(context.body);
    const courierId = readString(body.courierId);
    if (!courierId) {
      throw new ApiValidationError({ courierId: ["courierId is required"] });
    }

    const result = await this.lifecycle.assignCourier({
      orderId,
      courierId,
      actor: readString(body.actor),
    });
    return createJsonResponse(context, result.value);
  }

  async accept(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const body = readRecordBody(context.body);
    const result = await this.lifecycle.acceptDelivery({
      orderId,
      actor: readString(body.actor),
    });
    return createJsonResponse(context, result.value);
  }

  async start(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const body = readRecordBody(context.body);
    const result = await this.lifecycle.startDelivery({
      orderId,
      actor: readString(body.actor),
    });
    return createJsonResponse(context, result.value);
  }

  async arrive(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const body = readRecordBody(context.body);
    const result = await this.lifecycle.arriveToCustomer({
      orderId,
      actor: readString(body.actor),
    });
    return createJsonResponse(context, result.value);
  }

  async deliver(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const body = readRecordBody(context.body);
    const result = await this.lifecycle.completeDelivery({
      orderId,
      actor: readString(body.actor),
    });
    return createJsonResponse(context, result.value);
  }

  async cancel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const body = readRecordBody(context.body);
    const reason = readString(body.reason);
    if (!reason) {
      throw new ApiValidationError({ reason: ["reason is required"] });
    }

    const result = await this.lifecycle.cancelOrder({
      orderId,
      reason,
      actor: readString(body.actor),
    });
    return createJsonResponse(context, result.value);
  }

  async returnOrder(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const body = readRecordBody(context.body);
    const reason = readString(body.reason);
    if (!reason) {
      throw new ApiValidationError({ reason: ["reason is required"] });
    }

    const result = await this.lifecycle.returnOrder({
      orderId,
      reason,
      actor: readString(body.actor),
    });
    return createJsonResponse(context, result.value);
  }

  async refund(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const body = readRecordBody(context.body);
    const reason = readString(body.reason);
    if (!reason) {
      throw new ApiValidationError({ reason: ["reason is required"] });
    }

    const result = await this.lifecycle.refundOrder({
      orderId,
      reason,
      actor: readString(body.actor),
    });
    return createJsonResponse(context, result.value);
  }

  async timeline(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = this.requireOrderId(context);
    const result = await this.lifecycle.getTimeline(orderId);
    return createJsonResponse(context, result.value);
  }

  private requireOrderId(context: ApiRequestContext): string {
    const orderId = context.params.id;
    if (!orderId?.trim()) {
      throw new ApiValidationError({ id: ["Order id is required"] });
    }
    return orderId;
  }
}
