import { ApiValidationError } from "@server/api/errors/api.errors";
import type { SecretsManagementApplicationService } from "@server/application/secrets-management/services/secrets-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Secrets HTTP controller — secure secret storage and retrieval only. */
export class SecretsManagementController {
  constructor(private readonly secrets: SecretsManagementApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const key = readString(body.key);
    const value = readString(body.value);
    const description = readString(body.description);
    const tags = this.readTags(body.tags);

    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    if (!value) {
      throw new ApiValidationError({ value: ["value is required"] });
    }

    const result = await this.secrets.registerSecret({
      key,
      value,
      description: description ?? undefined,
      tags,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.secrets.listSecrets();
    return createJsonResponse(context, result.value);
  }

  async get(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.secrets.getSecret(key);
    if (!result.value) {
      throw new ApiValidationError({ key: [`Secret not found: ${key}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async update(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const body = readRecordBody(context.body);
    const value = readString(body.value);
    const description = readString(body.description);
    const tags = this.readTags(body.tags);

    if (!value) {
      throw new ApiValidationError({ value: ["value is required"] });
    }

    const result = await this.secrets.updateSecret({
      key,
      value,
      description: description ?? undefined,
      tags,
    });
    return createJsonResponse(context, result.value);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.secrets.deleteSecret(key);
    return createJsonResponse(context, result.value);
  }

  async exists(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireExistsKey(context);
    const result = await this.secrets.secretExists(key);
    return createJsonResponse(context, result.value);
  }

  async exportMetadata(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.secrets.exportSecretMetadata();
    return createJsonResponse(context, result.value);
  }

  async importMetadata(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const payload = readString(body.payload);
    if (!payload) {
      throw new ApiValidationError({ payload: ["payload is required"] });
    }

    const result = await this.secrets.importSecretMetadata({ payload });
    return createJsonResponse(context, result.value);
  }

  private requireKey(context: ApiRequestContext): string {
    const key = readString(context.params.key);
    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    return key;
  }

  private requireExistsKey(context: ApiRequestContext): string {
    const key = readString(context.params.key);
    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    return key;
  }

  private readTags(value: unknown): Readonly<Record<string, string>> | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "object" || Array.isArray(value)) {
      throw new ApiValidationError({ tags: ["tags must be an object"] });
    }

    const tags: Record<string, string> = {};
    for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
      if (typeof entryValue !== "string") {
        throw new ApiValidationError({ tags: [`tags.${key} must be a string`] });
      }
      tags[key] = entryValue;
    }

    return tags;
  }
}
