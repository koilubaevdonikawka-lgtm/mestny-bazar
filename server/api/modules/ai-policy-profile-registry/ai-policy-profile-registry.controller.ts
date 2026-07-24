import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiPolicyProfileRegistryApplicationService } from "@server/application/ai-policy-profile-registry/services/ai-policy-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Policy Profile Registry HTTP controller — policy profile management only. */
export class AiPolicyProfileRegistryController {
  constructor(
    private readonly policyProfileRegistry: AiPolicyProfileRegistryApplicationService,
  ) {}

  async registerPolicyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.policyProfileRegistry.registerPolicyProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listPolicyProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.policyProfileRegistry.listPolicyProfiles();
    return createJsonResponse(context, result.value);
  }

  async getPolicyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policyProfileId = this.requirePolicyProfileId(context);
    const result = await this.policyProfileRegistry.getPolicyProfile(policyProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        policyProfileId: [`Policy profile not found: ${policyProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updatePolicyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policyProfileId = this.requirePolicyProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.policyProfileRegistry.updatePolicyProfile({
      policyProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removePolicyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policyProfileId = this.requirePolicyProfileId(context);
    const result = await this.policyProfileRegistry.deletePolicyProfile(policyProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.policyProfileRegistry.findPolicyProfileByName(name);
    if (!result.value.policyProfile) {
      throw new ApiValidationError({ name: [`Policy profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.policyProfileRegistry.listPolicyProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.policyProfileRegistry.getPolicyProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requirePolicyProfileId(context: ApiRequestContext): string {
    const policyProfileId = readString(context.params.policyProfileId);
    if (!policyProfileId) {
      throw new ApiValidationError({ policyProfileId: ["policyProfileId is required"] });
    }
    return policyProfileId;
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
