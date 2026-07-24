import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiServiceProfileRegistryApplicationService } from "@server/application/ai-service-profile-registry/services/ai-service-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Service Profile Registry HTTP controller — service profile management only. */
export class AiServiceProfileRegistryController {
  constructor(
    private readonly serviceProfileRegistry: AiServiceProfileRegistryApplicationService,
  ) {}

  async registerServiceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.serviceProfileRegistry.registerServiceProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listServiceProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.serviceProfileRegistry.listServiceProfiles();
    return createJsonResponse(context, result.value);
  }

  async getServiceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const serviceProfileId = this.requireServiceProfileId(context);
    const result = await this.serviceProfileRegistry.getServiceProfile(serviceProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        serviceProfileId: [`Service profile not found: ${serviceProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateServiceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const serviceProfileId = this.requireServiceProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.serviceProfileRegistry.updateServiceProfile({
      serviceProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeServiceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const serviceProfileId = this.requireServiceProfileId(context);
    const result = await this.serviceProfileRegistry.deleteServiceProfile(serviceProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.serviceProfileRegistry.findServiceProfileByName(name);
    if (!result.value.serviceProfile) {
      throw new ApiValidationError({ name: [`Service profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.serviceProfileRegistry.listServiceProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.serviceProfileRegistry.getServiceProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireServiceProfileId(context: ApiRequestContext): string {
    const serviceProfileId = readString(context.params.serviceProfileId);
    if (!serviceProfileId) {
      throw new ApiValidationError({ serviceProfileId: ["serviceProfileId is required"] });
    }
    return serviceProfileId;
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
