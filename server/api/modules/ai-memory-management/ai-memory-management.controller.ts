import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiMemoryManagementApplicationService } from "@server/application/ai-memory-management/services/ai-memory-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Memory Management HTTP controller — memory record management only. */
export class AiMemoryManagementController {
  constructor(private readonly memoryManagement: AiMemoryManagementApplicationService) {}

  async registerRecord(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const key = readString(body.key);
    const category = readString(body.category);

    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }

    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.memoryManagement.registerMemoryRecord({
      key,
      category,
      description: description ?? undefined,
      data: "data" in body ? body.data : undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listRecords(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.memoryManagement.listMemoryRecords();
    return createJsonResponse(context, result.value);
  }

  async getRecord(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const memoryId = this.requireMemoryId(context);
    const result = await this.memoryManagement.getMemoryRecord(memoryId);
    if (!result.value) {
      throw new ApiValidationError({
        memoryId: [`Memory record not found: ${memoryId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateRecord(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const memoryId = this.requireMemoryId(context);
    const body = readRecordBody(context.body);
    const key = readString(body.key);
    const category = readString(body.category);
    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.memoryManagement.updateMemoryRecord({
      memoryId,
      key: key ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      data: "data" in body ? body.data : undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeRecord(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const memoryId = this.requireMemoryId(context);
    const result = await this.memoryManagement.deleteMemoryRecord(memoryId);
    return createJsonResponse(context, result.value);
  }

  async findByKey(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = readString(context.params.key);
    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    const result = await this.memoryManagement.findMemoryRecordsByKey(key);
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.memoryManagement.listMemoryRecordsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.memoryManagement.getMemoryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireMemoryId(context: ApiRequestContext): string {
    const memoryId = readString(context.params.memoryId);
    if (!memoryId) {
      throw new ApiValidationError({ memoryId: ["memoryId is required"] });
    }
    return memoryId;
  }

  private readStatus(value: unknown): "active" | "inactive" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (value === "active" || value === "inactive") {
      return value;
    }
    throw new ApiValidationError({ status: ["status must be 'active' or 'inactive'"] });
  }
}
