import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiComplianceRuleRegistryApplicationService } from "@server/application/ai-compliance-rule-registry/services/ai-compliance-rule-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Compliance Rule Registry HTTP controller — compliance rule management only. */
export class AiComplianceRuleRegistryController {
  constructor(
    private readonly complianceRuleRegistry: AiComplianceRuleRegistryApplicationService,
  ) {}

  async registerComplianceRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.complianceRuleRegistry.registerComplianceRule({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listComplianceRules(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.complianceRuleRegistry.listComplianceRules();
    return createJsonResponse(context, result.value);
  }

  async getComplianceRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const complianceRuleId = this.requireComplianceRuleId(context);
    const result = await this.complianceRuleRegistry.getComplianceRule(complianceRuleId);
    if (!result.value) {
      throw new ApiValidationError({
        complianceRuleId: [`Compliance rule not found: ${complianceRuleId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateComplianceRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const complianceRuleId = this.requireComplianceRuleId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.complianceRuleRegistry.updateComplianceRule({
      complianceRuleId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeComplianceRule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const complianceRuleId = this.requireComplianceRuleId(context);
    const result = await this.complianceRuleRegistry.deleteComplianceRule(complianceRuleId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.complianceRuleRegistry.findComplianceRuleByName(name);
    if (!result.value.complianceRule) {
      throw new ApiValidationError({ name: [`Compliance rule not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.complianceRuleRegistry.listComplianceRulesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.complianceRuleRegistry.getComplianceRuleRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireComplianceRuleId(context: ApiRequestContext): string {
    const complianceRuleId = readString(context.params.complianceRuleId);
    if (!complianceRuleId) {
      throw new ApiValidationError({ complianceRuleId: ["complianceRuleId is required"] });
    }
    return complianceRuleId;
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
