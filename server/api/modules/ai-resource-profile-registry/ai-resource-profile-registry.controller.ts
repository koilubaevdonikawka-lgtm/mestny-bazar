import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiResourceProfileRegistryApplicationService } from "@server/application/ai-resource-profile-registry/services/ai-resource-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Resource Profile Registry HTTP controller — resource profile management only. */
export class AiResourceProfileRegistryController {
  constructor(
    private readonly resourceProfileRegistry: AiResourceProfileRegistryApplicationService,
  ) {}

  async registerResourceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.resourceProfileRegistry.registerResourceProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listResourceProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.resourceProfileRegistry.listResourceProfiles();
    return createJsonResponse(context, result.value);
  }

  async getResourceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const resourceProfileId = this.requireResourceProfileId(context);
    const result = await this.resourceProfileRegistry.getResourceProfile(resourceProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        resourceProfileId: [`Resource profile not found: ${resourceProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateResourceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const resourceProfileId = this.requireResourceProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.resourceProfileRegistry.updateResourceProfile({
      resourceProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeResourceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const resourceProfileId = this.requireResourceProfileId(context);
    const result = await this.resourceProfileRegistry.deleteResourceProfile(resourceProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.resourceProfileRegistry.findResourceProfileByName(name);
    if (!result.value.resourceProfile) {
      throw new ApiValidationError({ name: [`Resource profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.resourceProfileRegistry.listResourceProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.resourceProfileRegistry.getResourceProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireResourceProfileId(context: ApiRequestContext): string {
    const resourceProfileId = readString(context.params.resourceProfileId);
    if (!resourceProfileId) {
      throw new ApiValidationError({ resourceProfileId: ["resourceProfileId is required"] });
    }
    return resourceProfileId;
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
