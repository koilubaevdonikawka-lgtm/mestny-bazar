/** Registered monitoring event — generic telemetry only, no domain knowledge. */
export interface MonitoringEvent {
  readonly eventId: string;
  readonly agentId: string;
  readonly type: string;
  readonly severity: "info" | "warning" | "error";
  readonly payload: unknown;
  readonly createdAt: string;
}

/** Registered agent status snapshot. */
export interface AgentStatus {
  readonly statusId: string;
  readonly agentId: string;
  readonly status: "online" | "offline" | "idle" | "busy" | "error";
  readonly details: string;
  readonly updatedAt: string;
}

/** Agent activity history entry. */
export interface AgentActivityEntry {
  readonly activityId: string;
  readonly agentId: string;
  readonly action: string;
  readonly payload: unknown;
  readonly createdAt: string;
}

export interface RegisterMonitoringEventInput {
  readonly agentId: string;
  readonly type: string;
  readonly severity?: "info" | "warning" | "error";
  readonly payload?: unknown;
}

export interface RegisterAgentStatusInput {
  readonly agentId: string;
  readonly status: "online" | "offline" | "idle" | "busy" | "error";
  readonly details?: string;
}

export interface ListMonitoringEventsResult {
  readonly events: readonly MonitoringEvent[];
  readonly total: number;
}

export interface ListAgentStatusesResult {
  readonly statuses: readonly AgentStatus[];
  readonly total: number;
}

export interface GetAgentActivityHistoryInput {
  readonly agentId?: string;
}

export interface GetAgentActivityHistoryResult {
  readonly entries: readonly AgentActivityEntry[];
  readonly total: number;
  readonly agentId: string | null;
}

export interface MonitoringMetrics {
  readonly totalEvents: number;
  readonly totalStatuses: number;
  readonly totalActivities: number;
  readonly eventsBySeverity: Readonly<Record<"info" | "warning" | "error", number>>;
  readonly statusesByState: Readonly<Record<"online" | "offline" | "idle" | "busy" | "error", number>>;
}

export interface MonitoringStatistics {
  readonly totalEvents: number;
  readonly totalAgents: number;
  readonly totalActivities: number;
  readonly lastEventAt: string | null;
}

export function createMonitoringEvent(input: {
  eventId: string;
  agentId: string;
  type: string;
  severity?: "info" | "warning" | "error";
  payload?: unknown;
  createdAt?: string;
}): MonitoringEvent {
  return Object.freeze({
    eventId: input.eventId,
    agentId: input.agentId.trim(),
    type: input.type.trim(),
    severity: input.severity ?? "info",
    payload: input.payload ?? Object.freeze({}),
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}

export function createAgentStatus(input: {
  statusId: string;
  agentId: string;
  status: "online" | "offline" | "idle" | "busy" | "error";
  details?: string;
  updatedAt?: string;
}): AgentStatus {
  return Object.freeze({
    statusId: input.statusId,
    agentId: input.agentId.trim(),
    status: input.status,
    details: (input.details ?? "").trim(),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  });
}

export function createAgentActivityEntry(input: {
  activityId: string;
  agentId: string;
  action: string;
  payload?: unknown;
  createdAt?: string;
}): AgentActivityEntry {
  return Object.freeze({
    activityId: input.activityId,
    agentId: input.agentId.trim(),
    action: input.action.trim(),
    payload: input.payload ?? Object.freeze({}),
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}
