import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiProfileRegistryApplicationService } from "@server/application/ai-profile-registry/services/ai-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Profile Registry HTTP controller — profile management only. */
export class AiProfileRegistryController {
  constructor(private readonly profileRegistry: AiProfileRegistryApplicationService) {}

  async registerProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const type = readString(body.type);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!type) {
      throw new ApiValidationError({ type: ["type is required"] });
    }

    const description = readString(body.description);
    const configuration = readString(body.configuration);
    const status = this.readStatus(body.status);

    const result = await this.profileRegistry.registerProfile({
      name,
      type,
      description: description ?? undefined,
      configuration: configuration ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.profileRegistry.listProfiles();
    return createJsonResponse(context, result.value);
  }

  async getProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const profileId = this.requireProfileId(context);
    const result = await this.profileRegistry.getProfile(profileId);
    if (!result.value) {
      throw new ApiValidationError({
        profileId: [`Profile not found: ${profileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const profileId = this.requireProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const type = readString(body.type);
    const description = readString(body.description);
    const configuration = readString(body.configuration);
    const status = this.readStatus(body.status);

    const result = await this.profileRegistry.updateProfile({
      profileId,
      name: name ?? undefined,
      type: type ?? undefined,
      description: description ?? undefined,
      configuration: configuration ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const profileId = this.requireProfileId(context);
    const result = await this.profileRegistry.deleteProfile(profileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.profileRegistry.findProfileByName(name);
    if (!result.value.profile) {
      throw new ApiValidationError({ name: [`Profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByType(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const type = readString(context.params.type);
    if (!type) {
      throw new ApiValidationError({ type: ["type is required"] });
    }
    const result = await this.profileRegistry.listProfilesByType(type);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.profileRegistry.getProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireProfileId(context: ApiRequestContext): string {
    const profileId = readString(context.params.profileId);
    if (!profileId) {
      throw new ApiValidationError({ profileId: ["profileId is required"] });
    }
    return profileId;
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
