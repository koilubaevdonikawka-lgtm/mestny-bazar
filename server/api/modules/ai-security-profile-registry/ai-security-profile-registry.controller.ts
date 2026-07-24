import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiSecurityProfileRegistryApplicationService } from "@server/application/ai-security-profile-registry/services/ai-security-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Security Profile Registry HTTP controller — security profile management only. */
export class AiSecurityProfileRegistryController {
  constructor(
    private readonly securityProfileRegistry: AiSecurityProfileRegistryApplicationService,
  ) {}

  async registerSecurityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.securityProfileRegistry.registerSecurityProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listSecurityProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.securityProfileRegistry.listSecurityProfiles();
    return createJsonResponse(context, result.value);
  }

  async getSecurityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const securityProfileId = this.requireSecurityProfileId(context);
    const result = await this.securityProfileRegistry.getSecurityProfile(securityProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        securityProfileId: [`Security profile not found: ${securityProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateSecurityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const securityProfileId = this.requireSecurityProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.securityProfileRegistry.updateSecurityProfile({
      securityProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeSecurityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const securityProfileId = this.requireSecurityProfileId(context);
    const result = await this.securityProfileRegistry.deleteSecurityProfile(securityProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.securityProfileRegistry.findSecurityProfileByName(name);
    if (!result.value.securityProfile) {
      throw new ApiValidationError({ name: [`Security profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.securityProfileRegistry.listSecurityProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.securityProfileRegistry.getSecurityProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireSecurityProfileId(context: ApiRequestContext): string {
    const securityProfileId = readString(context.params.securityProfileId);
    if (!securityProfileId) {
      throw new ApiValidationError({ securityProfileId: ["securityProfileId is required"] });
    }
    return securityProfileId;
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
