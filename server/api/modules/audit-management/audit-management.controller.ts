import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AuditManagementApplicationService } from "@server/application/audit-management/services/audit-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readQueryString,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Audit management HTTP controller — audit event registration only. */
export class AuditManagementController {
  constructor(private readonly audit: AuditManagementApplicationService) {}

  async write(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const userId = readString(body.userId) ?? resolveCustomerId(context);
    const module = readString(body.module);
    const eventType = readString(body.eventType);
    const message = readString(body.message);

    if (!module) {
      throw new ApiValidationError({ module: ["module is required"] });
    }
    if (!eventType) {
      throw new ApiValidationError({ eventType: ["eventType is required"] });
    }
    if (!message) {
      throw new ApiValidationError({ message: ["message is required"] });
    }

    const result = await this.audit.writeAuditEntry({
      userId,
      module,
      eventType,
      resourceId: readString(body.resourceId),
      message,
      metadata: readMetadata(body.metadata),
    });
    return createJsonResponse(context, result.value, 201);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.audit.getAuditLog();
    return createJsonResponse(context, result.value);
  }

  async getById(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const auditId = this.requireAuditId(context);
    const result = await this.audit.getAuditEntry(auditId);
    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }
    return createJsonResponse(context, result.value);
  }

  async byUser(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const userId = readString(context.params.userId);
    if (!userId) {
      throw new ApiValidationError({ userId: ["userId is required"] });
    }
    const result = await this.audit.getAuditByUser(userId);
    return createJsonResponse(context, result.value);
  }

  async byModule(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const module = readString(context.params.module);
    if (!module) {
      throw new ApiValidationError({ module: ["module is required"] });
    }
    const result = await this.audit.getAuditByModule(module);
    return createJsonResponse(context, result.value);
  }

  async byEventType(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const eventType = readString(context.params.eventType);
    if (!eventType) {
      throw new ApiValidationError({ eventType: ["eventType is required"] });
    }
    const result = await this.audit.getAuditByEventType(eventType);
    return createJsonResponse(context, result.value);
  }

  async byDateRange(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const from = readQueryString(context.query, "from");
    const to = readQueryString(context.query, "to");

    if (!from) {
      throw new ApiValidationError({ from: ["from is required"] });
    }
    if (!to) {
      throw new ApiValidationError({ to: ["to is required"] });
    }

    const result = await this.audit.getAuditByDateRange({ from, to });
    return createJsonResponse(context, result.value);
  }

  private requireAuditId(context: ApiRequestContext): string {
    const auditId = readString(context.params.auditId);
    if (!auditId) {
      throw new ApiValidationError({ auditId: ["auditId is required"] });
    }
    return auditId;
  }
}

function readMetadata(value: unknown): Record<string, string> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const metadata: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") {
      metadata[key] = entry;
    }
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}
