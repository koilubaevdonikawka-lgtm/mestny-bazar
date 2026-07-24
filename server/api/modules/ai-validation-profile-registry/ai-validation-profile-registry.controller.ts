import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiValidationProfileRegistryApplicationService } from "@server/application/ai-validation-profile-registry/services/ai-validation-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Validation Profile Registry HTTP controller — validation profile management only. */
export class AiValidationProfileRegistryController {
  constructor(
    private readonly validationProfileRegistry: AiValidationProfileRegistryApplicationService,
  ) {}

  async registerValidationProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.validationProfileRegistry.registerValidationProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listValidationProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.validationProfileRegistry.listValidationProfiles();
    return createJsonResponse(context, result.value);
  }

  async getValidationProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const validationProfileId = this.requireValidationProfileId(context);
    const result = await this.validationProfileRegistry.getValidationProfile(validationProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        validationProfileId: [`Validation profile not found: ${validationProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateValidationProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const validationProfileId = this.requireValidationProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.validationProfileRegistry.updateValidationProfile({
      validationProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeValidationProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const validationProfileId = this.requireValidationProfileId(context);
    const result = await this.validationProfileRegistry.deleteValidationProfile(validationProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.validationProfileRegistry.findValidationProfileByName(name);
    if (!result.value.validationProfile) {
      throw new ApiValidationError({ name: [`Validation profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.validationProfileRegistry.listValidationProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.validationProfileRegistry.getValidationProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireValidationProfileId(context: ApiRequestContext): string {
    const validationProfileId = readString(context.params.validationProfileId);
    if (!validationProfileId) {
      throw new ApiValidationError({ validationProfileId: ["validationProfileId is required"] });
    }
    return validationProfileId;
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
