import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiRiskProfileRegistryApplicationService } from "@server/application/ai-risk-profile-registry/services/ai-risk-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Risk Profile Registry HTTP controller — risk profile management only. */
export class AiRiskProfileRegistryController {
  constructor(
    private readonly riskProfileRegistry: AiRiskProfileRegistryApplicationService,
  ) {}

  async registerRiskProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.riskProfileRegistry.registerRiskProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listRiskProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.riskProfileRegistry.listRiskProfiles();
    return createJsonResponse(context, result.value);
  }

  async getRiskProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const riskProfileId = this.requireRiskProfileId(context);
    const result = await this.riskProfileRegistry.getRiskProfile(riskProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        riskProfileId: [`Risk profile not found: ${riskProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateRiskProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const riskProfileId = this.requireRiskProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.riskProfileRegistry.updateRiskProfile({
      riskProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeRiskProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const riskProfileId = this.requireRiskProfileId(context);
    const result = await this.riskProfileRegistry.deleteRiskProfile(riskProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.riskProfileRegistry.findRiskProfileByName(name);
    if (!result.value.riskProfile) {
      throw new ApiValidationError({ name: [`Risk profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.riskProfileRegistry.listRiskProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.riskProfileRegistry.getRiskProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireRiskProfileId(context: ApiRequestContext): string {
    const riskProfileId = readString(context.params.riskProfileId);
    if (!riskProfileId) {
      throw new ApiValidationError({ riskProfileId: ["riskProfileId is required"] });
    }
    return riskProfileId;
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
