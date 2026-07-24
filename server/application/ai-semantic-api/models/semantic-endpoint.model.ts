/** Registered semantic endpoint — generic metadata only, no domain knowledge. */
export interface SemanticEndpoint {
  readonly endpointId: string;
  readonly name: string;
  readonly path: string;
  readonly description: string;
  readonly schema: unknown;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterSemanticEndpointInput {
  readonly name: string;
  readonly path: string;
  readonly description?: string;
  readonly schema?: unknown;
  readonly status?: "active" | "inactive";
}

export interface UpdateSemanticEndpointInput {
  readonly endpointId: string;
  readonly name?: string;
  readonly path?: string;
  readonly description?: string;
  readonly schema?: unknown;
  readonly status?: "active" | "inactive";
}

export interface HandleSemanticRequestInput {
  readonly endpointId?: string;
  readonly intent?: string;
  readonly payload?: unknown;
}

export interface HandleSemanticRequestResult {
  readonly requestId: string;
  readonly endpointId: string | null;
  readonly intent: string | null;
  readonly response: unknown;
  readonly mock: boolean;
}

export interface SemanticRequestHistoryEntry {
  readonly requestId: string;
  readonly endpointId: string | null;
  readonly intent: string | null;
  readonly input: unknown;
  readonly response: unknown;
  readonly mock: boolean;
  readonly createdAt: string;
}

export interface ListSemanticEndpointsResult {
  readonly endpoints: readonly SemanticEndpoint[];
  readonly total: number;
}

export interface GetSemanticRequestHistoryResult {
  readonly entries: readonly SemanticRequestHistoryEntry[];
  readonly total: number;
}

export interface DeleteSemanticEndpointResult {
  readonly endpointId: string;
  readonly deleted: boolean;
}

export interface SemanticApiStatistics {
  readonly totalEndpoints: number;
  readonly activeEndpoints: number;
  readonly totalRequests: number;
}

export function createSemanticEndpoint(input: {
  endpointId: string;
  name: string;
  path: string;
  description?: string;
  schema?: unknown;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): SemanticEndpoint {
  const now = new Date().toISOString();
  return Object.freeze({
    endpointId: input.endpointId,
    name: input.name.trim(),
    path: input.path.trim(),
    description: (input.description ?? "").trim(),
    schema: input.schema ?? Object.freeze({ type: "object", properties: {} }),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function createSemanticRequestHistoryEntry(input: {
  requestId: string;
  endpointId?: string | null;
  intent?: string | null;
  input: unknown;
  response: unknown;
  mock: boolean;
  createdAt?: string;
}): SemanticRequestHistoryEntry {
  return Object.freeze({
    requestId: input.requestId,
    endpointId: input.endpointId ?? null,
    intent: input.intent ?? null,
    input: input.input,
    response: input.response,
    mock: input.mock,
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}
