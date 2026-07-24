import { ApiValidationError } from "@server/api/errors/api.errors";
import type { SchedulingManagementApplicationService } from "@server/application/scheduling-management/services/scheduling-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readQueryString,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Scheduling management HTTP controller — scheduled tasks only. */
export class SchedulingManagementController {
  constructor(private readonly scheduling: SchedulingManagementApplicationService) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const handlerKey = readString(body.handlerKey);
    const schedule = readString(body.schedule);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!handlerKey) {
      throw new ApiValidationError({ handlerKey: ["handlerKey is required"] });
    }
    if (!schedule) {
      throw new ApiValidationError({ schedule: ["schedule is required"] });
    }

    const result = await this.scheduling.registerTask({ name, handlerKey, schedule });
    return createJsonResponse(context, result.value, 201);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.scheduling.listTasks();
    return createJsonResponse(context, result.value);
  }

  async getById(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const result = await this.scheduling.getTask(taskId);
    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }
    return createJsonResponse(context, result.value);
  }

  async delete(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const result = await this.scheduling.deleteTask(taskId);
    return createJsonResponse(context, result.value);
  }

  async run(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const result = await this.scheduling.runTask(taskId);
    return createJsonResponse(context, result.value);
  }

  async pause(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const result = await this.scheduling.pauseTask(taskId);
    return createJsonResponse(context, result.value);
  }

  async resume(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = this.requireTaskId(context);
    const result = await this.scheduling.resumeTask(taskId);
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taskId = readQueryString(context.query, "taskId");
    const result = await this.scheduling.getExecutionHistory(taskId);
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
