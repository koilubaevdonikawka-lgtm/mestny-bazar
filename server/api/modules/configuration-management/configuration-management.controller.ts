import { ApiValidationError } from "@server/api/errors/api.errors";
import type { ConfigurationManagementApplicationService } from "@server/application/configuration-management/services/configuration-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Configuration management HTTP controller — system parameters only. */
export class ConfigurationManagementController {
  constructor(private readonly configuration: ConfigurationManagementApplicationService) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const key = readString(body.key);
    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    if (!("value" in body)) {
      throw new ApiValidationError({ value: ["value is required"] });
    }

    const result = await this.configuration.register({
      key,
      value: body.value,
      description: readString(body.description),
      encrypted: readBoolean(body.encrypted),
    });
    return createJsonResponse(context, result.value, 201);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.configuration.list();
    return createJsonResponse(context, result.value);
  }

  async getByKey(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.configuration.get(key);
    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }
    return createJsonResponse(context, result.value);
  }

  async update(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const body = readRecordBody(context.body);
    if (!("value" in body)) {
      throw new ApiValidationError({ value: ["value is required"] });
    }

    const result = await this.configuration.update({
      key,
      value: body.value,
      description: readString(body.description),
    });
    return createJsonResponse(context, result.value);
  }

  async delete(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.configuration.delete(key);
    return createJsonResponse(context, result.value);
  }

  async exportConfig(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.configuration.exportConfiguration();
    return createJsonResponse(context, result.value);
  }

  async importConfig(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const payload = body.payload ?? body;

    const result = await this.configuration.importConfiguration({
      payload: payload as string | Readonly<Record<string, unknown>>,
    });
    return createJsonResponse(context, result.value);
  }

  async exists(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const key = this.requireKey(context);
    const result = await this.configuration.exists(key);
    return createJsonResponse(context, result.value);
  }

  private requireKey(context: ApiRequestContext): string {
    const key = readString(context.params.key);
    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }
    return key;
  }
}

function readBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
  }
  return undefined;
}
