import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiClusterProfileRegistryApplicationService } from "@server/application/ai-cluster-profile-registry/services/ai-cluster-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Cluster Profile Registry HTTP controller — cluster profile management only. */
export class AiClusterProfileRegistryController {
  constructor(
    private readonly clusterProfileRegistry: AiClusterProfileRegistryApplicationService,
  ) {}

  async registerClusterProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.clusterProfileRegistry.registerClusterProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listClusterProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.clusterProfileRegistry.listClusterProfiles();
    return createJsonResponse(context, result.value);
  }

  async getClusterProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const clusterProfileId = this.requireClusterProfileId(context);
    const result = await this.clusterProfileRegistry.getClusterProfile(clusterProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        clusterProfileId: [`Cluster profile not found: ${clusterProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateClusterProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const clusterProfileId = this.requireClusterProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.clusterProfileRegistry.updateClusterProfile({
      clusterProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeClusterProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const clusterProfileId = this.requireClusterProfileId(context);
    const result = await this.clusterProfileRegistry.deleteClusterProfile(clusterProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.clusterProfileRegistry.findClusterProfileByName(name);
    if (!result.value.clusterProfile) {
      throw new ApiValidationError({ name: [`Cluster profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.clusterProfileRegistry.listClusterProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.clusterProfileRegistry.getClusterProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireClusterProfileId(context: ApiRequestContext): string {
    const clusterProfileId = readString(context.params.clusterProfileId);
    if (!clusterProfileId) {
      throw new ApiValidationError({ clusterProfileId: ["clusterProfileId is required"] });
    }
    return clusterProfileId;
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
