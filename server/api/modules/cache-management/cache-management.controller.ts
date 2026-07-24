import { ApiValidationError } from "@server/api/errors/api.errors";
import type { CacheManagementApplicationService } from "@server/application/cache-management/services/cache-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Cache HTTP controller — cache storage and retrieval only. */
export class CacheManagementController {
  constructor(private readonly cache: CacheManagementApplicationService) {}

  async set(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const key = readString(body.key);

    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    if (!("value" in body)) {
      throw new ApiValidationError({ value: ["value is required"] });
    }

    const group = readString(body.group);
    const ttlSeconds = this.readOptionalPositiveNumber(body.ttlSeconds);

    const result = await this.cache.setCacheValue({
      key,
      value: body.value,
      group: group ?? undefined,
      ttlSeconds,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async get(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.cache.getCacheValue(key);
    if (!result.value) {
      throw new ApiValidationError({ key: [`Cache key not found: ${key}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async exists(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.cache.cacheKeyExists(key);
    return createJsonResponse(context, result.value);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.cache.deleteCacheValue(key);
    return createJsonResponse(context, result.value);
  }

  async removeGroup(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const group = readString(context.params.group);
    if (!group) {
      throw new ApiValidationError({ group: ["group is required"] });
    }
    const result = await this.cache.deleteCacheGroup(group);
    return createJsonResponse(context, result.value);
  }

  async clear(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.cache.clearCache();
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.cache.getCacheStatistics();
    return createJsonResponse(context, result.value);
  }

  async listKeys(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.cache.listCacheKeys();
    return createJsonResponse(context, result.value);
  }

  private requireKey(context: ApiRequestContext): string {
    const key = readString(context.params.key);
    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    return key;
  }

  private readOptionalPositiveNumber(value: unknown): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
      throw new ApiValidationError({
        ttlSeconds: ["ttlSeconds must be a positive number"],
      });
    }
    return value;
  }
}
