import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiInfrastructureProfileRegistryApplicationService } from "@server/application/ai-infrastructure-profile-registry/services/ai-infrastructure-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Infrastructure Profile Registry HTTP controller — infrastructure profile management only. */
export class AiInfrastructureProfileRegistryController {
  constructor(
    private readonly infrastructureProfileRegistry: AiInfrastructureProfileRegistryApplicationService,
  ) {}

  async registerInfrastructureProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.infrastructureProfileRegistry.registerInfrastructureProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listInfrastructureProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.infrastructureProfileRegistry.listInfrastructureProfiles();
    return createJsonResponse(context, result.value);
  }

  async getInfrastructureProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const infrastructureProfileId = this.requireInfrastructureProfileId(context);
    const result = await this.infrastructureProfileRegistry.getInfrastructureProfile(infrastructureProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        infrastructureProfileId: [`Infrastructure profile not found: ${infrastructureProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateInfrastructureProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const infrastructureProfileId = this.requireInfrastructureProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.infrastructureProfileRegistry.updateInfrastructureProfile({
      infrastructureProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeInfrastructureProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const infrastructureProfileId = this.requireInfrastructureProfileId(context);
    const result = await this.infrastructureProfileRegistry.deleteInfrastructureProfile(infrastructureProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.infrastructureProfileRegistry.findInfrastructureProfileByName(name);
    if (!result.value.infrastructureProfile) {
      throw new ApiValidationError({ name: [`Infrastructure profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.infrastructureProfileRegistry.listInfrastructureProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.infrastructureProfileRegistry.getInfrastructureProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireInfrastructureProfileId(context: ApiRequestContext): string {
    const infrastructureProfileId = readString(context.params.infrastructureProfileId);
    if (!infrastructureProfileId) {
      throw new ApiValidationError({ infrastructureProfileId: ["infrastructureProfileId is required"] });
    }
    return infrastructureProfileId;
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
