import { ApiValidationError } from "@server/api/errors/api.errors";
import type { WarehouseManagementApplicationService } from "@server/application/warehouse-management/services/warehouse-management-application.service";
import {
  isPickingStatus,
  PickingStatus,
} from "@server/application/warehouse-management";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Warehouse management HTTP controller — picking lifecycle only. */
export class WarehouseManagementController {
  constructor(private readonly warehouse: WarehouseManagementApplicationService) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const orderId = readString(body.orderId);
    if (!orderId) {
      throw new ApiValidationError({ orderId: ["orderId is required"] });
    }

    const result = await this.warehouse.createPickingTask(orderId);
    return createJsonResponse(context, result.value, 201);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.warehouse.getPickingTasks();
    return createJsonResponse(context, result.value);
  }

  async getById(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const result = await this.warehouse.getPickingTask(taskId);
    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }
    return createJsonResponse(context, result.value);
  }

  async assignPicker(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const body = readRecordBody(context.body);
    const pickerId = readString(body.pickerId);
    if (!pickerId) {
      throw new ApiValidationError({ pickerId: ["pickerId is required"] });
    }

    const result = await this.warehouse.assignPicker(taskId, pickerId);
    return createJsonResponse(context, result.value);
  }

  async updateStatus(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const body = readRecordBody(context.body);
    const statusRaw = readString(body.status);
    if (!statusRaw || !isPickingStatus(statusRaw)) {
      throw new ApiValidationError({
        status: [`status must be one of: ${Object.values(PickingStatus).join(", ")}`],
      });
    }

    const result = await this.warehouse.updateStatus(
      taskId,
      statusRaw,
      readString(body.actor),
      readString(body.reason),
    );
    return createJsonResponse(context, result.value);
  }

  async complete(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const result = await this.warehouse.completePicking(taskId);
    return createJsonResponse(context, result.value);
  }

  async cancel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const body = readRecordBody(context.body);
    const result = await this.warehouse.cancelPickingTask(taskId, readString(body.reason));
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const result = await this.warehouse.getHistory(taskId);
    return createJsonResponse(context, result.value);
  }

  private requireTaskId(context: ApiRequestContext): string {
    const taskId = readString(context.params.taskId);
    if (!taskId) {
      throw new ApiValidationError({ taskId: ["taskId is required"] });
    }
    return taskId;
  }
}
