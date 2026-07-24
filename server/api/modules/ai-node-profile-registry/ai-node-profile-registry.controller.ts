import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiNodeProfileRegistryApplicationService } from "@server/application/ai-node-profile-registry/services/ai-node-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Node Profile Registry HTTP controller — node profile management only. */
export class AiNodeProfileRegistryController {
  constructor(
    private readonly nodeProfileRegistry: AiNodeProfileRegistryApplicationService,
  ) {}

  async registerNodeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.nodeProfileRegistry.registerNodeProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listNodeProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.nodeProfileRegistry.listNodeProfiles();
    return createJsonResponse(context, result.value);
  }

  async getNodeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const nodeProfileId = this.requireNodeProfileId(context);
    const result = await this.nodeProfileRegistry.getNodeProfile(nodeProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        nodeProfileId: [`Node profile not found: ${nodeProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateNodeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const nodeProfileId = this.requireNodeProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.nodeProfileRegistry.updateNodeProfile({
      nodeProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeNodeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const nodeProfileId = this.requireNodeProfileId(context);
    const result = await this.nodeProfileRegistry.deleteNodeProfile(nodeProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.nodeProfileRegistry.findNodeProfileByName(name);
    if (!result.value.nodeProfile) {
      throw new ApiValidationError({ name: [`Node profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.nodeProfileRegistry.listNodeProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.nodeProfileRegistry.getNodeProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireNodeProfileId(context: ApiRequestContext): string {
    const nodeProfileId = readString(context.params.nodeProfileId);
    if (!nodeProfileId) {
      throw new ApiValidationError({ nodeProfileId: ["nodeProfileId is required"] });
    }
    return nodeProfileId;
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
