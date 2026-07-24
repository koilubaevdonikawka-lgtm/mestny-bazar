import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiStorageProfileRegistryApplicationService } from "@server/application/ai-storage-profile-registry/services/ai-storage-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Storage Profile Registry HTTP controller — storage profile management only. */
export class AiStorageProfileRegistryController {
  constructor(
    private readonly storageProfileRegistry: AiStorageProfileRegistryApplicationService,
  ) {}

  async registerStorageProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.storageProfileRegistry.registerStorageProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listStorageProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.storageProfileRegistry.listStorageProfiles();
    return createJsonResponse(context, result.value);
  }

  async getStorageProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const storageProfileId = this.requireStorageProfileId(context);
    const result = await this.storageProfileRegistry.getStorageProfile(storageProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        storageProfileId: [`Storage profile not found: ${storageProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateStorageProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const storageProfileId = this.requireStorageProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.storageProfileRegistry.updateStorageProfile({
      storageProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeStorageProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const storageProfileId = this.requireStorageProfileId(context);
    const result = await this.storageProfileRegistry.deleteStorageProfile(storageProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.storageProfileRegistry.findStorageProfileByName(name);
    if (!result.value.storageProfile) {
      throw new ApiValidationError({ name: [`Storage profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.storageProfileRegistry.listStorageProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.storageProfileRegistry.getStorageProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireStorageProfileId(context: ApiRequestContext): string {
    const storageProfileId = readString(context.params.storageProfileId);
    if (!storageProfileId) {
      throw new ApiValidationError({ storageProfileId: ["storageProfileId is required"] });
    }
    return storageProfileId;
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
