import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiRiskRuleRegistryApplicationService } from "@server/application/ai-risk-rule-registry/services/ai-risk-rule-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Risk Rule Registry HTTP controller — risk rule management only. */
export class AiRiskRuleRegistryController {
  constructor(
    private readonly riskRuleRegistry: AiRiskRuleRegistryApplicationService,
  ) {}

  async registerRiskRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.riskRuleRegistry.registerRiskRule({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listRiskRules(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.riskRuleRegistry.listRiskRules();
    return createJsonResponse(context, result.value);
  }

  async getRiskRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const riskRuleId = this.requireRiskRuleId(context);
    const result = await this.riskRuleRegistry.getRiskRule(riskRuleId);
    if (!result.value) {
      throw new ApiValidationError({
        riskRuleId: [`Risk rule not found: ${riskRuleId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateRiskRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const riskRuleId = this.requireRiskRuleId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.riskRuleRegistry.updateRiskRule({
      riskRuleId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeRiskRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const riskRuleId = this.requireRiskRuleId(context);
    const result = await this.riskRuleRegistry.deleteRiskRule(riskRuleId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.riskRuleRegistry.findRiskRuleByName(name);
    if (!result.value.riskRule) {
      throw new ApiValidationError({ name: [`Risk rule not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.riskRuleRegistry.listRiskRulesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.riskRuleRegistry.getRiskRuleRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireRiskRuleId(context: ApiRequestContext): string {
    const riskRuleId = readString(context.params.riskRuleId);
    if (!riskRuleId) {
      throw new ApiValidationError({ riskRuleId: ["riskRuleId is required"] });
    }
    return riskRuleId;
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
