import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiAcceleratorProfileRegistryApplicationService } from "@server/application/ai-accelerator-profile-registry/services/ai-accelerator-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Accelerator Profile Registry HTTP controller — accelerator profile management only. */
export class AiAcceleratorProfileRegistryController {
  constructor(
    private readonly acceleratorProfileRegistry: AiAcceleratorProfileRegistryApplicationService,
  ) {}

  async registerAcceleratorProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.acceleratorProfileRegistry.registerAcceleratorProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listAcceleratorProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.acceleratorProfileRegistry.listAcceleratorProfiles();
    return createJsonResponse(context, result.value);
  }

  async getAcceleratorProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const acceleratorProfileId = this.requireAcceleratorProfileId(context);
    const result = await this.acceleratorProfileRegistry.getAcceleratorProfile(acceleratorProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        acceleratorProfileId: [`Accelerator profile not found: ${acceleratorProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateAcceleratorProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const acceleratorProfileId = this.requireAcceleratorProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.acceleratorProfileRegistry.updateAcceleratorProfile({
      acceleratorProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeAcceleratorProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const acceleratorProfileId = this.requireAcceleratorProfileId(context);
    const result = await this.acceleratorProfileRegistry.deleteAcceleratorProfile(acceleratorProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.acceleratorProfileRegistry.findAcceleratorProfileByName(name);
    if (!result.value.acceleratorProfile) {
      throw new ApiValidationError({ name: [`Accelerator profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.acceleratorProfileRegistry.listAcceleratorProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.acceleratorProfileRegistry.getAcceleratorProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireAcceleratorProfileId(context: ApiRequestContext): string {
    const acceleratorProfileId = readString(context.params.acceleratorProfileId);
    if (!acceleratorProfileId) {
      throw new ApiValidationError({ acceleratorProfileId: ["acceleratorProfileId is required"] });
    }
    return acceleratorProfileId;
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
