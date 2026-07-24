import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiHardwareProfileRegistryApplicationService } from "@server/application/ai-hardware-profile-registry/services/ai-hardware-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Hardware Profile Registry HTTP controller — hardware profile management only. */
export class AiHardwareProfileRegistryController {
  constructor(
    private readonly hardwareProfileRegistry: AiHardwareProfileRegistryApplicationService,
  ) {}

  async registerHardwareProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.hardwareProfileRegistry.registerHardwareProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listHardwareProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.hardwareProfileRegistry.listHardwareProfiles();
    return createJsonResponse(context, result.value);
  }

  async getHardwareProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const hardwareProfileId = this.requireHardwareProfileId(context);
    const result = await this.hardwareProfileRegistry.getHardwareProfile(hardwareProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        hardwareProfileId: [`Hardware profile not found: ${hardwareProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateHardwareProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const hardwareProfileId = this.requireHardwareProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.hardwareProfileRegistry.updateHardwareProfile({
      hardwareProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeHardwareProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const hardwareProfileId = this.requireHardwareProfileId(context);
    const result = await this.hardwareProfileRegistry.deleteHardwareProfile(hardwareProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.hardwareProfileRegistry.findHardwareProfileByName(name);
    if (!result.value.hardwareProfile) {
      throw new ApiValidationError({ name: [`Hardware profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.hardwareProfileRegistry.listHardwareProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.hardwareProfileRegistry.getHardwareProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireHardwareProfileId(context: ApiRequestContext): string {
    const hardwareProfileId = readString(context.params.hardwareProfileId);
    if (!hardwareProfileId) {
      throw new ApiValidationError({ hardwareProfileId: ["hardwareProfileId is required"] });
    }
    return hardwareProfileId;
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
