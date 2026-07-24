import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiExecutionEnvironmentRegistryApplicationService } from "@server/application/ai-execution-environment-registry/services/ai-execution-environment-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Execution Environment Registry HTTP controller — execution environment management only. */
export class AiExecutionEnvironmentRegistryController {
  constructor(
    private readonly executionEnvironmentRegistry: AiExecutionEnvironmentRegistryApplicationService,
  ) {}

  async registerExecutionEnvironment(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.executionEnvironmentRegistry.registerExecutionEnvironment({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listExecutionEnvironments(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.executionEnvironmentRegistry.listExecutionEnvironments();
    return createJsonResponse(context, result.value);
  }

  async getExecutionEnvironment(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const executionEnvironmentId = this.requireExecutionEnvironmentId(context);
    const result = await this.executionEnvironmentRegistry.getExecutionEnvironment(executionEnvironmentId);
    if (!result.value) {
      throw new ApiValidationError({
        executionEnvironmentId: [`Execution environment not found: ${executionEnvironmentId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateExecutionEnvironment(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const executionEnvironmentId = this.requireExecutionEnvironmentId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.executionEnvironmentRegistry.updateExecutionEnvironment({
      executionEnvironmentId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeExecutionEnvironment(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const executionEnvironmentId = this.requireExecutionEnvironmentId(context);
    const result = await this.executionEnvironmentRegistry.deleteExecutionEnvironment(executionEnvironmentId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.executionEnvironmentRegistry.findExecutionEnvironmentByName(name);
    if (!result.value.executionEnvironment) {
      throw new ApiValidationError({ name: [`Execution environment not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.executionEnvironmentRegistry.listExecutionEnvironmentsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.executionEnvironmentRegistry.getExecutionEnvironmentRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireExecutionEnvironmentId(context: ApiRequestContext): string {
    const executionEnvironmentId = readString(context.params.executionEnvironmentId);
    if (!executionEnvironmentId) {
      throw new ApiValidationError({ executionEnvironmentId: ["executionEnvironmentId is required"] });
    }
    return executionEnvironmentId;
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
