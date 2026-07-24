import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiSafetyProfileRegistryApplicationService } from "@server/application/ai-safety-profile-registry/services/ai-safety-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Safety Profile Registry HTTP controller — safety profile management only. */
export class AiSafetyProfileRegistryController {
  constructor(
    private readonly safetyProfileRegistry: AiSafetyProfileRegistryApplicationService,
  ) {}

  async registerSafetyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.safetyProfileRegistry.registerSafetyProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listSafetyProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.safetyProfileRegistry.listSafetyProfiles();
    return createJsonResponse(context, result.value);
  }

  async getSafetyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const safetyProfileId = this.requireSafetyProfileId(context);
    const result = await this.safetyProfileRegistry.getSafetyProfile(safetyProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        safetyProfileId: [`Safety profile not found: ${safetyProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateSafetyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const safetyProfileId = this.requireSafetyProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.safetyProfileRegistry.updateSafetyProfile({
      safetyProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeSafetyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const safetyProfileId = this.requireSafetyProfileId(context);
    const result = await this.safetyProfileRegistry.deleteSafetyProfile(safetyProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.safetyProfileRegistry.findSafetyProfileByName(name);
    if (!result.value.safetyProfile) {
      throw new ApiValidationError({ name: [`Safety profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.safetyProfileRegistry.listSafetyProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.safetyProfileRegistry.getSafetyProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireSafetyProfileId(context: ApiRequestContext): string {
    const safetyProfileId = readString(context.params.safetyProfileId);
    if (!safetyProfileId) {
      throw new ApiValidationError({ safetyProfileId: ["safetyProfileId is required"] });
    }
    return safetyProfileId;
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
