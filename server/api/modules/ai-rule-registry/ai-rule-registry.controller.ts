import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiRuleRegistryApplicationService } from "@server/application/ai-rule-registry/services/ai-rule-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Rule Registry HTTP controller — rule management only. */
export class AiRuleRegistryController {
  constructor(
    private readonly ruleRegistry: AiRuleRegistryApplicationService,
  ) {}

  async registerRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.ruleRegistry.registerRule({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listRules(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.ruleRegistry.listRules();
    return createJsonResponse(context, result.value);
  }

  async getRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const ruleId = this.requireRuleId(context);
    const result = await this.ruleRegistry.getRule(ruleId);
    if (!result.value) {
      throw new ApiValidationError({
        ruleId: [`Rule not found: ${ruleId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const ruleId = this.requireRuleId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.ruleRegistry.updateRule({
      ruleId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const ruleId = this.requireRuleId(context);
    const result = await this.ruleRegistry.deleteRule(ruleId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.ruleRegistry.findRuleByName(name);
    if (!result.value.rule) {
      throw new ApiValidationError({ name: [`Rule not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.ruleRegistry.listRulesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.ruleRegistry.getRuleRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireRuleId(context: ApiRequestContext): string {
    const ruleId = readString(context.params.ruleId);
    if (!ruleId) {
      throw new ApiValidationError({ ruleId: ["ruleId is required"] });
    }
    return ruleId;
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
