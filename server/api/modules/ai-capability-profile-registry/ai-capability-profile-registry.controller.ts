import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiCapabilityProfileRegistryApplicationService } from "@server/application/ai-capability-profile-registry/services/ai-capability-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Capability Profile Registry HTTP controller — capability profile management only. */
export class AiCapabilityProfileRegistryController {
  constructor(
    private readonly capabilityProfileRegistry: AiCapabilityProfileRegistryApplicationService,
  ) {}

  async registerCapabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.capabilityProfileRegistry.registerCapabilityProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listCapabilityProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.capabilityProfileRegistry.listCapabilityProfiles();
    return createJsonResponse(context, result.value);
  }

  async getCapabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const capabilityProfileId = this.requireCapabilityProfileId(context);
    const result = await this.capabilityProfileRegistry.getCapabilityProfile(capabilityProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        capabilityProfileId: [`Capability profile not found: ${capabilityProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateCapabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const capabilityProfileId = this.requireCapabilityProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.capabilityProfileRegistry.updateCapabilityProfile({
      capabilityProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeCapabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const capabilityProfileId = this.requireCapabilityProfileId(context);
    const result = await this.capabilityProfileRegistry.deleteCapabilityProfile(capabilityProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.capabilityProfileRegistry.findCapabilityProfileByName(name);
    if (!result.value.capabilityProfile) {
      throw new ApiValidationError({ name: [`Capability profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.capabilityProfileRegistry.listCapabilityProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.capabilityProfileRegistry.getCapabilityProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireCapabilityProfileId(context: ApiRequestContext): string {
    const capabilityProfileId = readString(context.params.capabilityProfileId);
    if (!capabilityProfileId) {
      throw new ApiValidationError({ capabilityProfileId: ["capabilityProfileId is required"] });
    }
    return capabilityProfileId;
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
