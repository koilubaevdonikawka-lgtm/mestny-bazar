import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiNetworkProfileRegistryApplicationService } from "@server/application/ai-network-profile-registry/services/ai-network-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Network Profile Registry HTTP controller — network profile management only. */
export class AiNetworkProfileRegistryController {
  constructor(
    private readonly networkProfileRegistry: AiNetworkProfileRegistryApplicationService,
  ) {}

  async registerNetworkProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.networkProfileRegistry.registerNetworkProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listNetworkProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.networkProfileRegistry.listNetworkProfiles();
    return createJsonResponse(context, result.value);
  }

  async getNetworkProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const networkProfileId = this.requireNetworkProfileId(context);
    const result = await this.networkProfileRegistry.getNetworkProfile(networkProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        networkProfileId: [`Network profile not found: ${networkProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateNetworkProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const networkProfileId = this.requireNetworkProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.networkProfileRegistry.updateNetworkProfile({
      networkProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeNetworkProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const networkProfileId = this.requireNetworkProfileId(context);
    const result = await this.networkProfileRegistry.deleteNetworkProfile(networkProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.networkProfileRegistry.findNetworkProfileByName(name);
    if (!result.value.networkProfile) {
      throw new ApiValidationError({ name: [`Network profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.networkProfileRegistry.listNetworkProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.networkProfileRegistry.getNetworkProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireNetworkProfileId(context: ApiRequestContext): string {
    const networkProfileId = readString(context.params.networkProfileId);
    if (!networkProfileId) {
      throw new ApiValidationError({ networkProfileId: ["networkProfileId is required"] });
    }
    return networkProfileId;
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
