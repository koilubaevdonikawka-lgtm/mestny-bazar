import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiEthicsProfileRegistryApplicationService } from "@server/application/ai-ethics-profile-registry/services/ai-ethics-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Ethics Profile Registry HTTP controller — ethics profile management only. */
export class AiEthicsProfileRegistryController {
  constructor(
    private readonly ethicsProfileRegistry: AiEthicsProfileRegistryApplicationService,
  ) {}

  async registerEthicsProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.ethicsProfileRegistry.registerEthicsProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listEthicsProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.ethicsProfileRegistry.listEthicsProfiles();
    return createJsonResponse(context, result.value);
  }

  async getEthicsProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const ethicsProfileId = this.requireEthicsProfileId(context);
    const result = await this.ethicsProfileRegistry.getEthicsProfile(ethicsProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        ethicsProfileId: [`Ethics profile not found: ${ethicsProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateEthicsProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const ethicsProfileId = this.requireEthicsProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.ethicsProfileRegistry.updateEthicsProfile({
      ethicsProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeEthicsProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const ethicsProfileId = this.requireEthicsProfileId(context);
    const result = await this.ethicsProfileRegistry.deleteEthicsProfile(ethicsProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.ethicsProfileRegistry.findEthicsProfileByName(name);
    if (!result.value.ethicsProfile) {
      throw new ApiValidationError({ name: [`Ethics profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.ethicsProfileRegistry.listEthicsProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.ethicsProfileRegistry.getEthicsProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireEthicsProfileId(context: ApiRequestContext): string {
    const ethicsProfileId = readString(context.params.ethicsProfileId);
    if (!ethicsProfileId) {
      throw new ApiValidationError({ ethicsProfileId: ["ethicsProfileId is required"] });
    }
    return ethicsProfileId;
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
