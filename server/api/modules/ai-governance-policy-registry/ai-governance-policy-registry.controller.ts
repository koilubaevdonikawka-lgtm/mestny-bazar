import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiGovernancePolicyRegistryApplicationService } from "@server/application/ai-governance-policy-registry/services/ai-governance-policy-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Governance Policy Registry HTTP controller — governance policy management only. */
export class AiGovernancePolicyRegistryController {
  constructor(
    private readonly governancePolicyRegistry: AiGovernancePolicyRegistryApplicationService,
  ) {}

  async registerGovernancePolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.governancePolicyRegistry.registerGovernancePolicy({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listGovernancePolicies(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.governancePolicyRegistry.listGovernancePolicies();
    return createJsonResponse(context, result.value);
  }

  async getGovernancePolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const governancePolicyId = this.requireGovernancePolicyId(context);
    const result = await this.governancePolicyRegistry.getGovernancePolicy(governancePolicyId);
    if (!result.value) {
      throw new ApiValidationError({
        governancePolicyId: [`Governance policy not found: ${governancePolicyId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateGovernancePolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const governancePolicyId = this.requireGovernancePolicyId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.governancePolicyRegistry.updateGovernancePolicy({
      governancePolicyId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeGovernancePolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const governancePolicyId = this.requireGovernancePolicyId(context);
    const result = await this.governancePolicyRegistry.deleteGovernancePolicy(governancePolicyId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.governancePolicyRegistry.findGovernancePolicyByName(name);
    if (!result.value.governancePolicy) {
      throw new ApiValidationError({ name: [`Governance policy not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.governancePolicyRegistry.listGovernancePoliciesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.governancePolicyRegistry.getGovernancePolicyRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireGovernancePolicyId(context: ApiRequestContext): string {
    const governancePolicyId = readString(context.params.governancePolicyId);
    if (!governancePolicyId) {
      throw new ApiValidationError({ governancePolicyId: ["governancePolicyId is required"] });
    }
    return governancePolicyId;
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
