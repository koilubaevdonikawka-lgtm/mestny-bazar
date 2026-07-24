import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiPolicyRegistryApplicationService } from "@server/application/ai-policy-registry/services/ai-policy-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Policy Registry HTTP controller — policy management only. */
export class AiPolicyRegistryController {
  constructor(private readonly policyRegistry: AiPolicyRegistryApplicationService) {}

  async registerPolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.policyRegistry.registerPolicy({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listPolicies(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.policyRegistry.listPolicies();
    return createJsonResponse(context, result.value);
  }

  async getPolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policyId = this.requirePolicyId(context);
    const result = await this.policyRegistry.getPolicy(policyId);
    if (!result.value) {
      throw new ApiValidationError({
        policyId: [`Policy not found: ${policyId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updatePolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policyId = this.requirePolicyId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.policyRegistry.updatePolicy({
      policyId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removePolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policyId = this.requirePolicyId(context);
    const result = await this.policyRegistry.deletePolicy(policyId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.policyRegistry.findPolicyByName(name);
    if (!result.value.policy) {
      throw new ApiValidationError({ name: [`Policy not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.policyRegistry.listPoliciesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.policyRegistry.getPolicyRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requirePolicyId(context: ApiRequestContext): string {
    const policyId = readString(context.params.policyId);
    if (!policyId) {
      throw new ApiValidationError({ policyId: ["policyId is required"] });
    }
    return policyId;
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
