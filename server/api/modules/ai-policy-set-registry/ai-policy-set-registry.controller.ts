import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiPolicySetRegistryApplicationService } from "@server/application/ai-policy-set-registry/services/ai-policy-set-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Policy Set Registry HTTP controller — policy set management only. */
export class AiPolicySetRegistryController {
  constructor(
    private readonly policySetRegistry: AiPolicySetRegistryApplicationService,
  ) {}

  async registerPolicySet(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.policySetRegistry.registerPolicySet({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listPolicySets(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.policySetRegistry.listPolicySets();
    return createJsonResponse(context, result.value);
  }

  async getPolicySet(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policySetId = this.requirePolicySetId(context);
    const result = await this.policySetRegistry.getPolicySet(policySetId);
    if (!result.value) {
      throw new ApiValidationError({
        policySetId: [`Policy set not found: ${policySetId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updatePolicySet(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policySetId = this.requirePolicySetId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.policySetRegistry.updatePolicySet({
      policySetId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removePolicySet(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policySetId = this.requirePolicySetId(context);
    const result = await this.policySetRegistry.deletePolicySet(policySetId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.policySetRegistry.findPolicySetByName(name);
    if (!result.value.policySet) {
      throw new ApiValidationError({ name: [`Policy set not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.policySetRegistry.listPolicySetsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.policySetRegistry.getPolicySetRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requirePolicySetId(context: ApiRequestContext): string {
    const policySetId = readString(context.params.policySetId);
    if (!policySetId) {
      throw new ApiValidationError({ policySetId: ["policySetId is required"] });
    }
    return policySetId;
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
