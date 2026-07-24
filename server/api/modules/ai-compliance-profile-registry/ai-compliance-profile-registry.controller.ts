import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiComplianceProfileRegistryApplicationService } from "@server/application/ai-compliance-profile-registry/services/ai-compliance-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Compliance Profile Registry HTTP controller — compliance profile management only. */
export class AiComplianceProfileRegistryController {
  constructor(
    private readonly complianceProfileRegistry: AiComplianceProfileRegistryApplicationService,
  ) {}

  async registerComplianceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.complianceProfileRegistry.registerComplianceProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listComplianceProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.complianceProfileRegistry.listComplianceProfiles();
    return createJsonResponse(context, result.value);
  }

  async getComplianceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const complianceProfileId = this.requireComplianceProfileId(context);
    const result = await this.complianceProfileRegistry.getComplianceProfile(complianceProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        complianceProfileId: [`Compliance profile not found: ${complianceProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateComplianceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const complianceProfileId = this.requireComplianceProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.complianceProfileRegistry.updateComplianceProfile({
      complianceProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeComplianceProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const complianceProfileId = this.requireComplianceProfileId(context);
    const result = await this.complianceProfileRegistry.deleteComplianceProfile(complianceProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.complianceProfileRegistry.findComplianceProfileByName(name);
    if (!result.value.complianceProfile) {
      throw new ApiValidationError({ name: [`Compliance profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.complianceProfileRegistry.listComplianceProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.complianceProfileRegistry.getComplianceProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireComplianceProfileId(context: ApiRequestContext): string {
    const complianceProfileId = readString(context.params.complianceProfileId);
    if (!complianceProfileId) {
      throw new ApiValidationError({ complianceProfileId: ["complianceProfileId is required"] });
    }
    return complianceProfileId;
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
