import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiGovernanceProfileRegistryApplicationService } from "@server/application/ai-governance-profile-registry/services/ai-governance-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Governance Profile Registry HTTP controller — governance profile management only. */
export class AiGovernanceProfileRegistryController {
  constructor(
    private readonly governanceProfileRegistry: AiGovernanceProfileRegistryApplicationService,
  ) {}

  async registerGovernanceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.governanceProfileRegistry.registerGovernanceProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listGovernanceProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.governanceProfileRegistry.listGovernanceProfiles();
    return createJsonResponse(context, result.value);
  }

  async getGovernanceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const governanceProfileId = this.requireGovernanceProfileId(context);
    const result = await this.governanceProfileRegistry.getGovernanceProfile(governanceProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        governanceProfileId: [`Governance profile not found: ${governanceProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateGovernanceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const governanceProfileId = this.requireGovernanceProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.governanceProfileRegistry.updateGovernanceProfile({
      governanceProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeGovernanceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const governanceProfileId = this.requireGovernanceProfileId(context);
    const result = await this.governanceProfileRegistry.deleteGovernanceProfile(governanceProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.governanceProfileRegistry.findGovernanceProfileByName(name);
    if (!result.value.governanceProfile) {
      throw new ApiValidationError({ name: [`Governance profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.governanceProfileRegistry.listGovernanceProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.governanceProfileRegistry.getGovernanceProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireGovernanceProfileId(context: ApiRequestContext): string {
    const governanceProfileId = readString(context.params.governanceProfileId);
    if (!governanceProfileId) {
      throw new ApiValidationError({ governanceProfileId: ["governanceProfileId is required"] });
    }
    return governanceProfileId;
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
