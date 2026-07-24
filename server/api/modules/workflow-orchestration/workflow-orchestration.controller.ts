import { ApiValidationError } from "@server/api/errors/api.errors";
import type { WorkflowOrchestrationApplicationService } from "@server/application/workflow-orchestration/services/workflow-orchestration-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Workflow orchestration HTTP controller — coordination only. */
export class WorkflowOrchestrationController {
  constructor(private readonly workflow: WorkflowOrchestrationApplicationService) {}

  async placeOrder(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const body = readRecordBody(context.body);
    const checkoutId = readString(body.checkoutId);
    if (!checkoutId) {
      throw new ApiValidationError({ checkoutId: ["checkoutId is required"] });
    }

    const result = await this.workflow.placeOrder(customerId, checkoutId);
    return createJsonResponse(context, result.value, 201);
  }

  async paymentSucceeded(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const paymentId = this.requirePaymentId(context);
    const result = await this.workflow.paymentSucceeded(paymentId);
    return createJsonResponse(context, result.value);
  }

  async paymentFailed(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const paymentId = this.requirePaymentId(context);
    const body = readRecordBody(context.body);
    const result = await this.workflow.paymentFailed(paymentId, readString(body.reason));
    return createJsonResponse(context, result.value);
  }

  async warehouseCompleted(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const result = await this.workflow.warehouseCompleted(taskId);
    return createJsonResponse(context, result.value);
  }

  async deliveryCompleted(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const deliveryId = this.requireDeliveryId(context);
    const result = await this.workflow.deliveryCompleted(deliveryId);
    return createJsonResponse(context, result.value);
  }

  async cancelOrder(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const orderId = this.requireOrderId(context);
    const body = readRecordBody(context.body);
    const result = await this.workflow.cancelOrder(orderId, customerId, readString(body.reason));
    return createJsonResponse(context, result.value);
  }

  private requirePaymentId(context: ApiRequestContext): string {
    const paymentId = readString(context.params.paymentId);
    if (!paymentId) {
      throw new ApiValidationError({ paymentId: ["paymentId is required"] });
    }
    return paymentId;
  }

  private requireTaskId(context: ApiRequestContext): string {
    const taskId = readString(context.params.taskId);
    if (!taskId) {
      throw new ApiValidationError({ taskId: ["taskId is required"] });
    }
    return taskId;
  }

  private requireDeliveryId(context: ApiRequestContext): string {
    const deliveryId = readString(context.params.deliveryId);
    if (!deliveryId) {
      throw new ApiValidationError({ deliveryId: ["deliveryId is required"] });
    }
    return deliveryId;
  }

  private requireOrderId(context: ApiRequestContext): string {
    const orderId = readString(context.params.orderId);
    if (!orderId) {
      throw new ApiValidationError({ orderId: ["orderId is required"] });
    }
    return orderId;
  }
}
