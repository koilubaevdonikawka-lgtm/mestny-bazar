import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiAgentMonitoringApplicationService } from "@server/application/ai-agent-monitoring/services/ai-agent-monitoring-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readQueryString,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Agent Monitoring HTTP controller — telemetry and status tracking only. */
export class AiAgentMonitoringController {
  constructor(private readonly monitoring: AiAgentMonitoringApplicationService) {}

  async registerEvent(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const agentId = readString(body.agentId);
    const type = readString(body.type);

    if (!agentId) {
      throw new ApiValidationError({ agentId: ["agentId is required"] });
    }
    if (!type) {
      throw new ApiValidationError({ type: ["type is required"] });
    }

    const result = await this.monitoring.registerMonitoringEvent({
      agentId,
      type,
      severity: this.readSeverity(body.severity),
      payload: "payload" in body ? body.payload : undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listEvents(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.monitoring.listMonitoringEvents();
    return createJsonResponse(context, result.value);
  }

  async getEvent(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const eventId = this.requireEventId(context);
    const result = await this.monitoring.getMonitoringEvent(eventId);
    if (!result.value) {
      throw new ApiValidationError({ eventId: [`Monitoring event not found: ${eventId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async registerStatus(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const agentId = readString(body.agentId);
    const status = this.readAgentStatus(body.status);

    if (!agentId) {
      throw new ApiValidationError({ agentId: ["agentId is required"] });
    }
    if (!status) {
      throw new ApiValidationError({
        status: ["status is required and must be online, offline, idle, busy, or error"],
      });
    }

    const details = readString(body.details);
    const result = await this.monitoring.registerAgentStatus({
      agentId,
      status,
      details: details ?? undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listStatuses(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.monitoring.listAgentStatuses();
    return createJsonResponse(context, result.value);
  }

  async activityHistory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const agentId = readQueryString(context.query, "agentId");
    const result = await this.monitoring.getAgentActivityHistory({
      agentId: agentId ?? undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async metrics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.monitoring.getMonitoringMetrics();
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.monitoring.getMonitoringStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireEventId(context: ApiRequestContext): string {
    const eventId = readString(context.params.eventId);
    if (!eventId) {
      throw new ApiValidationError({ eventId: ["eventId is required"] });
    }
    return eventId;
  }

  private readSeverity(value: unknown): "info" | "warning" | "error" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (value === "info" || value === "warning" || value === "error") {
      return value;
    }
    throw new ApiValidationError({ severity: ["severity must be 'info', 'warning', or 'error'"] });
  }

  private readAgentStatus(
    value: unknown,
  ): "online" | "offline" | "idle" | "busy" | "error" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (
      value === "online" ||
      value === "offline" ||
      value === "idle" ||
      value === "busy" ||
      value === "error"
    ) {
      return value;
    }
    throw new ApiValidationError({
      status: ["status must be 'online', 'offline', 'idle', 'busy', or 'error'"],
    });
  }
}
