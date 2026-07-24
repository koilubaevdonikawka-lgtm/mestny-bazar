import { ApiValidationError } from "@server/api/errors/api.errors";
import type { LoggingManagementApplicationService } from "@server/application/logging-management/services/logging-management-application.service";
import { isLogLevel } from "@server/application/logging-management/models/log-entry.model";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Logging HTTP controller — system log registration and retrieval only. */
export class LoggingManagementController {
  constructor(private readonly logging: LoggingManagementApplicationService) {}

  async write(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const level = readString(body.level);
    const message = readString(body.message);
    const source = readString(body.source);
    const contextData = this.readContext(body.context);

    if (!level || !isLogLevel(level)) {
      throw new ApiValidationError({
        level: ["level is required and must be one of: debug, info, warn, error"],
      });
    }
    if (!message) {
      throw new ApiValidationError({ message: ["message is required"] });
    }

    const result = await this.logging.writeLog({
      level,
      message,
      source: source ?? undefined,
      context: contextData,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.logging.listLogs();
    return createJsonResponse(context, result.value);
  }

  async get(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const logId = this.requireLogId(context);
    const result = await this.logging.getLog(logId);
    if (!result.value) {
      throw new ApiValidationError({ logId: [`Log entry not found: ${logId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const logId = this.requireLogId(context);
    const result = await this.logging.deleteLog(logId);
    return createJsonResponse(context, result.value);
  }

  async clear(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.logging.clearLogs();
    return createJsonResponse(context, result.value);
  }

  async search(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const query = readString(body.query);
    if (!query) {
      throw new ApiValidationError({ query: ["query is required"] });
    }

    const result = await this.logging.searchLogs({ query });
    return createJsonResponse(context, result.value);
  }

  async filter(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const level = readString(body.level);
    const source = readString(body.source);
    const from = readString(body.from);
    const to = readString(body.to);

    if (level && !isLogLevel(level)) {
      throw new ApiValidationError({
        level: ["level must be one of: debug, info, warn, error"],
      });
    }

    const result = await this.logging.filterLogs({
      level: level && isLogLevel(level) ? level : undefined,
      source: source ?? undefined,
      from: from ?? undefined,
      to: to ?? undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async export(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.logging.exportLogs();
    return createJsonResponse(context, result.value);
  }

  private requireLogId(context: ApiRequestContext): string {
    const logId = readString(context.params.logId);
    if (!logId) {
      throw new ApiValidationError({ logId: ["logId is required"] });
    }
    return logId;
  }

  private readContext(value: unknown): Readonly<Record<string, string>> | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "object" || Array.isArray(value)) {
      throw new ApiValidationError({ context: ["context must be an object"] });
    }

    const contextRecord: Record<string, string> = {};
    for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
      if (typeof entryValue !== "string") {
        throw new ApiValidationError({
          context: [`context.${key} must be a string`],
        });
      }
      contextRecord[key] = entryValue;
    }

    return contextRecord;
  }
}
