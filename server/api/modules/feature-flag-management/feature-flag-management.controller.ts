import { ApiValidationError } from "@server/api/errors/api.errors";
import type { FeatureFlagManagementApplicationService } from "@server/application/feature-flag-management/services/feature-flag-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Feature flag HTTP controller — flag registration and retrieval only. */
export class FeatureFlagManagementController {
  constructor(private readonly flags: FeatureFlagManagementApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const key = readString(body.key);
    const name = readString(body.name);
    const description = readString(body.description);
    const enabled = this.readBoolean(body.enabled);
    const tags = this.readTags(body.tags);

    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const result = await this.flags.registerFeatureFlag({
      key,
      name,
      description: description ?? undefined,
      enabled: enabled ?? undefined,
      tags,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.flags.listFeatureFlags();
    return createJsonResponse(context, result.value);
  }

  async get(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.flags.getFeatureFlag(key);
    if (!result.value) {
      throw new ApiValidationError({ key: [`Feature flag not found: ${key}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async update(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const description = readString(body.description);
    const tags = this.readTags(body.tags);

    const result = await this.flags.updateFeatureFlag({
      key,
      name: name ?? undefined,
      description: description ?? undefined,
      tags,
    });
    return createJsonResponse(context, result.value);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.flags.deleteFeatureFlag(key);
    return createJsonResponse(context, result.value);
  }

  async enable(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.flags.enableFeatureFlag(key);
    return createJsonResponse(context, result.value);
  }

  async disable(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.flags.disableFeatureFlag(key);
    return createJsonResponse(context, result.value);
  }

  async status(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.flags.getFeatureFlagStatus(key);
    return createJsonResponse(context, result.value);
  }

  private requireKey(context: ApiRequestContext): string {
    const key = readString(context.params.key);
    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    return key;
  }

  private readBoolean(value: unknown): boolean | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value !== "boolean") {
      throw new ApiValidationError({ enabled: ["enabled must be a boolean"] });
    }
    return value;
  }

  private readTags(value: unknown): Readonly<Record<string, string>> | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "object" || Array.isArray(value)) {
      throw new ApiValidationError({ tags: ["tags must be an object"] });
    }

    const tags: Record<string, string> = {};
    for (const [tagKey, entryValue] of Object.entries(value as Record<string, unknown>)) {
      if (typeof entryValue !== "string") {
        throw new ApiValidationError({ tags: [`tags.${tagKey} must be a string`] });
      }
      tags[tagKey] = entryValue;
    }

    return tags;
  }
}
