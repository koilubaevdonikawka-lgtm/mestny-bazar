import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiMemoryProfileRegistryApplicationService } from "@server/application/ai-memory-profile-registry/services/ai-memory-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Memory Profile Registry HTTP controller — memory profile management only. */
export class AiMemoryProfileRegistryController {
  constructor(
    private readonly memoryProfileRegistry: AiMemoryProfileRegistryApplicationService,
  ) {}

  async registerMemoryProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.memoryProfileRegistry.registerMemoryProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listMemoryProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.memoryProfileRegistry.listMemoryProfiles();
    return createJsonResponse(context, result.value);
  }

  async getMemoryProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const memoryProfileId = this.requireMemoryProfileId(context);
    const result = await this.memoryProfileRegistry.getMemoryProfile(memoryProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        memoryProfileId: [`Memory profile not found: ${memoryProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateMemoryProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const memoryProfileId = this.requireMemoryProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.memoryProfileRegistry.updateMemoryProfile({
      memoryProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeMemoryProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const memoryProfileId = this.requireMemoryProfileId(context);
    const result = await this.memoryProfileRegistry.deleteMemoryProfile(memoryProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.memoryProfileRegistry.findMemoryProfileByName(name);
    if (!result.value.memoryProfile) {
      throw new ApiValidationError({ name: [`Memory profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.memoryProfileRegistry.listMemoryProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.memoryProfileRegistry.getMemoryProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireMemoryProfileId(context: ApiRequestContext): string {
    const memoryProfileId = readString(context.params.memoryProfileId);
    if (!memoryProfileId) {
      throw new ApiValidationError({ memoryProfileId: ["memoryProfileId is required"] });
    }
    return memoryProfileId;
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
