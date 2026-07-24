import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiStrategyRegistryApplicationService } from "@server/application/ai-strategy-registry/services/ai-strategy-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Strategy Registry HTTP controller — strategy management only. */
export class AiStrategyRegistryController {
  constructor(private readonly strategyRegistry: AiStrategyRegistryApplicationService) {}

  async registerStrategy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.strategyRegistry.registerStrategy({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listStrategies(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.strategyRegistry.listStrategies();
    return createJsonResponse(context, result.value);
  }

  async getStrategy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const strategyId = this.requireStrategyId(context);
    const result = await this.strategyRegistry.getStrategy(strategyId);
    if (!result.value) {
      throw new ApiValidationError({
        strategyId: [`Strategy not found: ${strategyId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateStrategy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const strategyId = this.requireStrategyId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.strategyRegistry.updateStrategy({
      strategyId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeStrategy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const strategyId = this.requireStrategyId(context);
    const result = await this.strategyRegistry.deleteStrategy(strategyId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.strategyRegistry.findStrategyByName(name);
    if (!result.value.strategy) {
      throw new ApiValidationError({ name: [`Strategy not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.strategyRegistry.listStrategiesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.strategyRegistry.getStrategyRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireStrategyId(context: ApiRequestContext): string {
    const strategyId = readString(context.params.strategyId);
    if (!strategyId) {
      throw new ApiValidationError({ strategyId: ["strategyId is required"] });
    }
    return strategyId;
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
