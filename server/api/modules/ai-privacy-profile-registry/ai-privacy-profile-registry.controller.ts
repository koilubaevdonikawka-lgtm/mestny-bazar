import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiPrivacyProfileRegistryApplicationService } from "@server/application/ai-privacy-profile-registry/services/ai-privacy-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Privacy Profile Registry HTTP controller — privacy profile management only. */
export class AiPrivacyProfileRegistryController {
  constructor(
    private readonly privacyProfileRegistry: AiPrivacyProfileRegistryApplicationService,
  ) {}

  async registerPrivacyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.privacyProfileRegistry.registerPrivacyProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listPrivacyProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.privacyProfileRegistry.listPrivacyProfiles();
    return createJsonResponse(context, result.value);
  }

  async getPrivacyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const privacyProfileId = this.requirePrivacyProfileId(context);
    const result = await this.privacyProfileRegistry.getPrivacyProfile(privacyProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        privacyProfileId: [`Privacy profile not found: ${privacyProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updatePrivacyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const privacyProfileId = this.requirePrivacyProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.privacyProfileRegistry.updatePrivacyProfile({
      privacyProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removePrivacyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const privacyProfileId = this.requirePrivacyProfileId(context);
    const result = await this.privacyProfileRegistry.deletePrivacyProfile(privacyProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.privacyProfileRegistry.findPrivacyProfileByName(name);
    if (!result.value.privacyProfile) {
      throw new ApiValidationError({ name: [`Privacy profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.privacyProfileRegistry.listPrivacyProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.privacyProfileRegistry.getPrivacyProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requirePrivacyProfileId(context: ApiRequestContext): string {
    const privacyProfileId = readString(context.params.privacyProfileId);
    if (!privacyProfileId) {
      throw new ApiValidationError({ privacyProfileId: ["privacyProfileId is required"] });
    }
    return privacyProfileId;
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
