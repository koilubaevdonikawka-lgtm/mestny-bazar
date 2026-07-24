import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiReliabilityProfileRegistryApplicationService } from "@server/application/ai-reliability-profile-registry/services/ai-reliability-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Reliability Profile Registry HTTP controller — reliability profile management only. */
export class AiReliabilityProfileRegistryController {
  constructor(
    private readonly reliabilityProfileRegistry: AiReliabilityProfileRegistryApplicationService,
  ) {}

  async registerReliabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.reliabilityProfileRegistry.registerReliabilityProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listReliabilityProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.reliabilityProfileRegistry.listReliabilityProfiles();
    return createJsonResponse(context, result.value);
  }

  async getReliabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const reliabilityProfileId = this.requireReliabilityProfileId(context);
    const result = await this.reliabilityProfileRegistry.getReliabilityProfile(reliabilityProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        reliabilityProfileId: [`Reliability profile not found: ${reliabilityProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateReliabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const reliabilityProfileId = this.requireReliabilityProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.reliabilityProfileRegistry.updateReliabilityProfile({
      reliabilityProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeReliabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const reliabilityProfileId = this.requireReliabilityProfileId(context);
    const result = await this.reliabilityProfileRegistry.deleteReliabilityProfile(reliabilityProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.reliabilityProfileRegistry.findReliabilityProfileByName(name);
    if (!result.value.reliabilityProfile) {
      throw new ApiValidationError({ name: [`Reliability profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.reliabilityProfileRegistry.listReliabilityProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.reliabilityProfileRegistry.getReliabilityProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireReliabilityProfileId(context: ApiRequestContext): string {
    const reliabilityProfileId = readString(context.params.reliabilityProfileId);
    if (!reliabilityProfileId) {
      throw new ApiValidationError({ reliabilityProfileId: ["reliabilityProfileId is required"] });
    }
    return reliabilityProfileId;
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
