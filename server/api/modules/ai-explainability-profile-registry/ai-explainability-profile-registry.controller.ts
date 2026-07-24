import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiExplainabilityProfileRegistryApplicationService } from "@server/application/ai-explainability-profile-registry/services/ai-explainability-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Explainability Profile Registry HTTP controller — explainability profile management only. */
export class AiExplainabilityProfileRegistryController {
  constructor(
    private readonly explainabilityProfileRegistry: AiExplainabilityProfileRegistryApplicationService,
  ) {}

  async registerExplainabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.explainabilityProfileRegistry.registerExplainabilityProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listExplainabilityProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.explainabilityProfileRegistry.listExplainabilityProfiles();
    return createJsonResponse(context, result.value);
  }

  async getExplainabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const explainabilityProfileId = this.requireExplainabilityProfileId(context);
    const result = await this.explainabilityProfileRegistry.getExplainabilityProfile(explainabilityProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        explainabilityProfileId: [`Explainability profile not found: ${explainabilityProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateExplainabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const explainabilityProfileId = this.requireExplainabilityProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.explainabilityProfileRegistry.updateExplainabilityProfile({
      explainabilityProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeExplainabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const explainabilityProfileId = this.requireExplainabilityProfileId(context);
    const result = await this.explainabilityProfileRegistry.deleteExplainabilityProfile(explainabilityProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.explainabilityProfileRegistry.findExplainabilityProfileByName(name);
    if (!result.value.explainabilityProfile) {
      throw new ApiValidationError({ name: [`Explainability profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.explainabilityProfileRegistry.listExplainabilityProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.explainabilityProfileRegistry.getExplainabilityProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireExplainabilityProfileId(context: ApiRequestContext): string {
    const explainabilityProfileId = readString(context.params.explainabilityProfileId);
    if (!explainabilityProfileId) {
      throw new ApiValidationError({ explainabilityProfileId: ["explainabilityProfileId is required"] });
    }
    return explainabilityProfileId;
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
