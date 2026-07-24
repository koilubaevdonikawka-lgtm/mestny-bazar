import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiAccountabilityProfileRegistryApplicationService } from "@server/application/ai-accountability-profile-registry/services/ai-accountability-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Accountability Profile Registry HTTP controller — accountability profile management only. */
export class AiAccountabilityProfileRegistryController {
  constructor(
    private readonly accountabilityProfileRegistry: AiAccountabilityProfileRegistryApplicationService,
  ) {}

  async registerAccountabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.accountabilityProfileRegistry.registerAccountabilityProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listAccountabilityProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.accountabilityProfileRegistry.listAccountabilityProfiles();
    return createJsonResponse(context, result.value);
  }

  async getAccountabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const accountabilityProfileId = this.requireAccountabilityProfileId(context);
    const result = await this.accountabilityProfileRegistry.getAccountabilityProfile(accountabilityProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        accountabilityProfileId: [`Accountability profile not found: ${accountabilityProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateAccountabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const accountabilityProfileId = this.requireAccountabilityProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.accountabilityProfileRegistry.updateAccountabilityProfile({
      accountabilityProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeAccountabilityProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const accountabilityProfileId = this.requireAccountabilityProfileId(context);
    const result = await this.accountabilityProfileRegistry.deleteAccountabilityProfile(accountabilityProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.accountabilityProfileRegistry.findAccountabilityProfileByName(name);
    if (!result.value.accountabilityProfile) {
      throw new ApiValidationError({ name: [`Accountability profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.accountabilityProfileRegistry.listAccountabilityProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.accountabilityProfileRegistry.getAccountabilityProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireAccountabilityProfileId(context: ApiRequestContext): string {
    const accountabilityProfileId = readString(context.params.accountabilityProfileId);
    if (!accountabilityProfileId) {
      throw new ApiValidationError({ accountabilityProfileId: ["accountabilityProfileId is required"] });
    }
    return accountabilityProfileId;
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
