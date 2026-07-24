import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiTrustProfileRegistryApplicationService } from "@server/application/ai-trust-profile-registry/services/ai-trust-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Trust Profile Registry HTTP controller — trust profile management only. */
export class AiTrustProfileRegistryController {
  constructor(
    private readonly trustProfileRegistry: AiTrustProfileRegistryApplicationService,
  ) {}

  async registerTrustProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.trustProfileRegistry.registerTrustProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listTrustProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.trustProfileRegistry.listTrustProfiles();
    return createJsonResponse(context, result.value);
  }

  async getTrustProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const trustProfileId = this.requireTrustProfileId(context);
    const result = await this.trustProfileRegistry.getTrustProfile(trustProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        trustProfileId: [`Trust profile not found: ${trustProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateTrustProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const trustProfileId = this.requireTrustProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.trustProfileRegistry.updateTrustProfile({
      trustProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeTrustProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const trustProfileId = this.requireTrustProfileId(context);
    const result = await this.trustProfileRegistry.deleteTrustProfile(trustProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.trustProfileRegistry.findTrustProfileByName(name);
    if (!result.value.trustProfile) {
      throw new ApiValidationError({ name: [`Trust profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.trustProfileRegistry.listTrustProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.trustProfileRegistry.getTrustProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireTrustProfileId(context: ApiRequestContext): string {
    const trustProfileId = readString(context.params.trustProfileId);
    if (!trustProfileId) {
      throw new ApiValidationError({ trustProfileId: ["trustProfileId is required"] });
    }
    return trustProfileId;
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
