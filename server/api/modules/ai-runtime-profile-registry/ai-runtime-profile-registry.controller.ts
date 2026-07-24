import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiRuntimeProfileRegistryApplicationService } from "@server/application/ai-runtime-profile-registry/services/ai-runtime-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Runtime Profile Registry HTTP controller — runtime profile management only. */
export class AiRuntimeProfileRegistryController {
  constructor(
    private readonly runtimeProfileRegistry: AiRuntimeProfileRegistryApplicationService,
  ) {}

  async registerRuntimeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.runtimeProfileRegistry.registerRuntimeProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listRuntimeProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.runtimeProfileRegistry.listRuntimeProfiles();
    return createJsonResponse(context, result.value);
  }

  async getRuntimeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const runtimeProfileId = this.requireRuntimeProfileId(context);
    const result = await this.runtimeProfileRegistry.getRuntimeProfile(runtimeProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        runtimeProfileId: [`Runtime profile not found: ${runtimeProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateRuntimeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const runtimeProfileId = this.requireRuntimeProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.runtimeProfileRegistry.updateRuntimeProfile({
      runtimeProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeRuntimeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const runtimeProfileId = this.requireRuntimeProfileId(context);
    const result = await this.runtimeProfileRegistry.deleteRuntimeProfile(runtimeProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.runtimeProfileRegistry.findRuntimeProfileByName(name);
    if (!result.value.runtimeProfile) {
      throw new ApiValidationError({ name: [`Runtime profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.runtimeProfileRegistry.listRuntimeProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.runtimeProfileRegistry.getRuntimeProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireRuntimeProfileId(context: ApiRequestContext): string {
    const runtimeProfileId = readString(context.params.runtimeProfileId);
    if (!runtimeProfileId) {
      throw new ApiValidationError({ runtimeProfileId: ["runtimeProfileId is required"] });
    }
    return runtimeProfileId;
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
