/** Registered AI Agent — no domain knowledge. */
export interface AiAgent {
  readonly agentId: string;
  readonly name: string;
  readonly description: string;
  readonly providerType: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AgentRoute {
  readonly routeId: string;
  readonly routeKey: string;
  readonly agentId: string;
  readonly createdAt: string;
}

export interface AgentRequestHistoryEntry {
  readonly requestId: string;
  readonly agentId: string;
  readonly routeKey: string | null;
  readonly input: unknown;
  readonly response: unknown;
  readonly createdAt: string;
}

export interface RegisterAgentInput {
  readonly name: string;
  readonly description?: string;
  readonly providerType?: string;
  readonly status?: "active" | "inactive";
}

export interface RegisterAgentRouteInput {
  readonly routeKey: string;
  readonly agentId: string;
}

export interface RouteAgentRequestInput {
  readonly routeKey: string;
}

export interface ExecuteAgentRequestInput {
  readonly agentId?: string;
  readonly routeKey?: string;
  readonly prompt?: string;
  readonly payload?: unknown;
}

export interface RouteAgentRequestResult {
  readonly routeKey: string;
  readonly agentId: string;
  readonly agentName: string;
}

export interface ExecuteAgentRequestResult {
  readonly requestId: string;
  readonly agentId: string;
  readonly routeKey: string | null;
  readonly response: unknown;
  readonly mock: boolean;
}

export interface ListAgentsResult {
  readonly agents: readonly AiAgent[];
  readonly total: number;
}

export interface GetAgentRequestHistoryResult {
  readonly entries: readonly AgentRequestHistoryEntry[];
  readonly total: number;
}

export interface ClearAgentRequestHistoryResult {
  readonly removedCount: number;
}

export function createAiAgent(input: {
  agentId: string;
  name: string;
  description?: string;
  providerType?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): AiAgent {
  const now = new Date().toISOString();
  return Object.freeze({
    agentId: input.agentId,
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    providerType: (input.providerType ?? "mock").trim() || "mock",
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function createAgentRoute(input: {
  routeId: string;
  routeKey: string;
  agentId: string;
  createdAt?: string;
}): AgentRoute {
  return Object.freeze({
    routeId: input.routeId,
    routeKey: input.routeKey.trim(),
    agentId: input.agentId.trim(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}

export function createAgentRequestHistoryEntry(input: {
  requestId: string;
  agentId: string;
  routeKey?: string | null;
  input: unknown;
  response: unknown;
  createdAt?: string;
}): AgentRequestHistoryEntry {
  return Object.freeze({
    requestId: input.requestId,
    agentId: input.agentId,
    routeKey: input.routeKey ?? null,
    input: input.input,
    response: input.response,
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}
