import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiFairnessProfileRegistryApplicationService } from "@server/application/ai-fairness-profile-registry/services/ai-fairness-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Fairness Profile Registry HTTP controller — fairness profile management only. */
export class AiFairnessProfileRegistryController {
  constructor(
    private readonly fairnessProfileRegistry: AiFairnessProfileRegistryApplicationService,
  ) {}

  async registerFairnessProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.fairnessProfileRegistry.registerFairnessProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listFairnessProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.fairnessProfileRegistry.listFairnessProfiles();
    return createJsonResponse(context, result.value);
  }

  async getFairnessProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const fairnessProfileId = this.requireFairnessProfileId(context);
    const result = await this.fairnessProfileRegistry.getFairnessProfile(fairnessProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        fairnessProfileId: [`Fairness profile not found: ${fairnessProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateFairnessProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const fairnessProfileId = this.requireFairnessProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.fairnessProfileRegistry.updateFairnessProfile({
      fairnessProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeFairnessProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const fairnessProfileId = this.requireFairnessProfileId(context);
    const result = await this.fairnessProfileRegistry.deleteFairnessProfile(fairnessProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.fairnessProfileRegistry.findFairnessProfileByName(name);
    if (!result.value.fairnessProfile) {
      throw new ApiValidationError({ name: [`Fairness profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.fairnessProfileRegistry.listFairnessProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.fairnessProfileRegistry.getFairnessProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireFairnessProfileId(context: ApiRequestContext): string {
    const fairnessProfileId = readString(context.params.fairnessProfileId);
    if (!fairnessProfileId) {
      throw new ApiValidationError({ fairnessProfileId: ["fairnessProfileId is required"] });
    }
    return fairnessProfileId;
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
