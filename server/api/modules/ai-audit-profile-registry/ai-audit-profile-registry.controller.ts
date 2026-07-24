import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiAuditProfileRegistryApplicationService } from "@server/application/ai-audit-profile-registry/services/ai-audit-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Audit Profile Registry HTTP controller — audit profile management only. */
export class AiAuditProfileRegistryController {
  constructor(
    private readonly auditProfileRegistry: AiAuditProfileRegistryApplicationService,
  ) {}

  async registerAuditProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.auditProfileRegistry.registerAuditProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listAuditProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.auditProfileRegistry.listAuditProfiles();
    return createJsonResponse(context, result.value);
  }

  async getAuditProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const auditProfileId = this.requireAuditProfileId(context);
    const result = await this.auditProfileRegistry.getAuditProfile(auditProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        auditProfileId: [`Audit profile not found: ${auditProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateAuditProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const auditProfileId = this.requireAuditProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.auditProfileRegistry.updateAuditProfile({
      auditProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeAuditProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const auditProfileId = this.requireAuditProfileId(context);
    const result = await this.auditProfileRegistry.deleteAuditProfile(auditProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.auditProfileRegistry.findAuditProfileByName(name);
    if (!result.value.auditProfile) {
      throw new ApiValidationError({ name: [`Audit profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.auditProfileRegistry.listAuditProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.auditProfileRegistry.getAuditProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireAuditProfileId(context: ApiRequestContext): string {
    const auditProfileId = readString(context.params.auditProfileId);
    if (!auditProfileId) {
      throw new ApiValidationError({ auditProfileId: ["auditProfileId is required"] });
    }
    return auditProfileId;
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
