import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiEnvironmentProfileRegistryApplicationService } from "@server/application/ai-environment-profile-registry/services/ai-environment-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Environment Profile Registry HTTP controller — environment profile management only. */
export class AiEnvironmentProfileRegistryController {
  constructor(
    private readonly environmentProfileRegistry: AiEnvironmentProfileRegistryApplicationService,
  ) {}

  async registerEnvironmentProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.environmentProfileRegistry.registerEnvironmentProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listEnvironmentProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.environmentProfileRegistry.listEnvironmentProfiles();
    return createJsonResponse(context, result.value);
  }

  async getEnvironmentProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const environmentProfileId = this.requireEnvironmentProfileId(context);
    const result = await this.environmentProfileRegistry.getEnvironmentProfile(environmentProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        environmentProfileId: [`Environment profile not found: ${environmentProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateEnvironmentProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const environmentProfileId = this.requireEnvironmentProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.environmentProfileRegistry.updateEnvironmentProfile({
      environmentProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeEnvironmentProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const environmentProfileId = this.requireEnvironmentProfileId(context);
    const result = await this.environmentProfileRegistry.deleteEnvironmentProfile(environmentProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.environmentProfileRegistry.findEnvironmentProfileByName(name);
    if (!result.value.environmentProfile) {
      throw new ApiValidationError({ name: [`Environment profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.environmentProfileRegistry.listEnvironmentProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.environmentProfileRegistry.getEnvironmentProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireEnvironmentProfileId(context: ApiRequestContext): string {
    const environmentProfileId = readString(context.params.environmentProfileId);
    if (!environmentProfileId) {
      throw new ApiValidationError({ environmentProfileId: ["environmentProfileId is required"] });
    }
    return environmentProfileId;
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
