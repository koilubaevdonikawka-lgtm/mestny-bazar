import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiExecutionProfileRegistryApplicationService } from "@server/application/ai-execution-profile-registry/services/ai-execution-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Execution Profile Registry HTTP controller — execution profile management only. */
export class AiExecutionProfileRegistryController {
  constructor(
    private readonly executionProfileRegistry: AiExecutionProfileRegistryApplicationService,
  ) {}

  async registerExecutionProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }

    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.executionProfileRegistry.registerExecutionProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listExecutionProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.executionProfileRegistry.listExecutionProfiles();
    return createJsonResponse(context, result.value);
  }

  async getExecutionProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const executionProfileId = this.requireExecutionProfileId(context);
    const result = await this.executionProfileRegistry.getExecutionProfile(executionProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        executionProfileId: [`Execution profile not found: ${executionProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateExecutionProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const executionProfileId = this.requireExecutionProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.executionProfileRegistry.updateExecutionProfile({
      executionProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeExecutionProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const executionProfileId = this.requireExecutionProfileId(context);
    const result = await this.executionProfileRegistry.deleteExecutionProfile(executionProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.executionProfileRegistry.findExecutionProfileByName(name);
    if (!result.value.executionProfile) {
      throw new ApiValidationError({ name: [`Execution profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.executionProfileRegistry.listExecutionProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.executionProfileRegistry.getExecutionProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireExecutionProfileId(context: ApiRequestContext): string {
    const executionProfileId = readString(context.params.executionProfileId);
    if (!executionProfileId) {
      throw new ApiValidationError({ executionProfileId: ["executionProfileId is required"] });
    }
    return executionProfileId;
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
