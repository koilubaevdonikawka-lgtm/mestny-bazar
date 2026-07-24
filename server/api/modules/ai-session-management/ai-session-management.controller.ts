import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiSessionManagementApplicationService } from "@server/application/ai-session-management/services/ai-session-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Session Management HTTP controller — session management only. */
export class AiSessionManagementController {
  constructor(private readonly sessionManagement: AiSessionManagementApplicationService) {}

  async createSession(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.sessionManagement.createSession({
      name,
      description: description ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listSessions(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.sessionManagement.listSessions();
    return createJsonResponse(context, result.value);
  }

  async getSession(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sessionId = this.requireSessionId(context);
    const result = await this.sessionManagement.getSession(sessionId);
    if (!result.value) {
      throw new ApiValidationError({
        sessionId: [`Session not found: ${sessionId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateSession(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sessionId = this.requireSessionId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.sessionManagement.updateSession({
      sessionId,
      name: name ?? undefined,
      description: description ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async closeSession(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sessionId = this.requireSessionId(context);
    const result = await this.sessionManagement.closeSession(sessionId);
    if (!result.value.closed) {
      throw new ApiValidationError({
        sessionId: [`Session not found: ${sessionId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.sessionManagement.findSessionByName(name);
    if (!result.value.session) {
      throw new ApiValidationError({ name: [`Session not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByStatus(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const status = readString(context.params.status);
    if (!status) {
      throw new ApiValidationError({ status: ["status is required"] });
    }
    const result = await this.sessionManagement.listSessionsByStatus(status);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.sessionManagement.getSessionStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireSessionId(context: ApiRequestContext): string {
    const sessionId = readString(context.params.sessionId);
    if (!sessionId) {
      throw new ApiValidationError({ sessionId: ["sessionId is required"] });
    }
    return sessionId;
  }

  private readStatus(value: unknown): "active" | "closed" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (value === "active" || value === "closed") {
      return value;
    }
    throw new ApiValidationError({ status: ["status must be 'active' or 'closed'"] });
  }
}
