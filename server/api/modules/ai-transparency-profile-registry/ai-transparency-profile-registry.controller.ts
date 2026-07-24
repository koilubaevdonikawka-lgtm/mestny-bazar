import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiTransparencyProfileRegistryApplicationService } from "@server/application/ai-transparency-profile-registry/services/ai-transparency-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Transparency Profile Registry HTTP controller — transparency profile management only. */
export class AiTransparencyProfileRegistryController {
  constructor(
    private readonly transparencyProfileRegistry: AiTransparencyProfileRegistryApplicationService,
  ) {}

  async registerTransparencyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.transparencyProfileRegistry.registerTransparencyProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listTransparencyProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.transparencyProfileRegistry.listTransparencyProfiles();
    return createJsonResponse(context, result.value);
  }

  async getTransparencyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const transparencyProfileId = this.requireTransparencyProfileId(context);
    const result = await this.transparencyProfileRegistry.getTransparencyProfile(transparencyProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        transparencyProfileId: [`Transparency profile not found: ${transparencyProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateTransparencyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const transparencyProfileId = this.requireTransparencyProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.transparencyProfileRegistry.updateTransparencyProfile({
      transparencyProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeTransparencyProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const transparencyProfileId = this.requireTransparencyProfileId(context);
    const result = await this.transparencyProfileRegistry.deleteTransparencyProfile(transparencyProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.transparencyProfileRegistry.findTransparencyProfileByName(name);
    if (!result.value.transparencyProfile) {
      throw new ApiValidationError({ name: [`Transparency profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.transparencyProfileRegistry.listTransparencyProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.transparencyProfileRegistry.getTransparencyProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireTransparencyProfileId(context: ApiRequestContext): string {
    const transparencyProfileId = readString(context.params.transparencyProfileId);
    if (!transparencyProfileId) {
      throw new ApiValidationError({ transparencyProfileId: ["transparencyProfileId is required"] });
    }
    return transparencyProfileId;
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
