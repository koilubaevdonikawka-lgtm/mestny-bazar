import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiComputeProfileRegistryApplicationService } from "@server/application/ai-compute-profile-registry/services/ai-compute-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Compute Profile Registry HTTP controller — compute profile management only. */
export class AiComputeProfileRegistryController {
  constructor(
    private readonly computeProfileRegistry: AiComputeProfileRegistryApplicationService,
  ) {}

  async registerComputeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.computeProfileRegistry.registerComputeProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listComputeProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.computeProfileRegistry.listComputeProfiles();
    return createJsonResponse(context, result.value);
  }

  async getComputeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const computeProfileId = this.requireComputeProfileId(context);
    const result = await this.computeProfileRegistry.getComputeProfile(computeProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        computeProfileId: [`Compute profile not found: ${computeProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateComputeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const computeProfileId = this.requireComputeProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.computeProfileRegistry.updateComputeProfile({
      computeProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeComputeProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const computeProfileId = this.requireComputeProfileId(context);
    const result = await this.computeProfileRegistry.deleteComputeProfile(computeProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.computeProfileRegistry.findComputeProfileByName(name);
    if (!result.value.computeProfile) {
      throw new ApiValidationError({ name: [`Compute profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.computeProfileRegistry.listComputeProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.computeProfileRegistry.getComputeProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireComputeProfileId(context: ApiRequestContext): string {
    const computeProfileId = readString(context.params.computeProfileId);
    if (!computeProfileId) {
      throw new ApiValidationError({ computeProfileId: ["computeProfileId is required"] });
    }
    return computeProfileId;
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
