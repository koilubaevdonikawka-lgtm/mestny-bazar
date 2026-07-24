/** Registered MCP Tool — generic protocol metadata only. */
export interface McpTool {
  readonly toolId: string;
  readonly name: string;
  readonly description: string;
  readonly inputSchema: unknown;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Registered MCP Resource — generic protocol metadata only. */
export interface McpResource {
  readonly resourceId: string;
  readonly uri: string;
  readonly name: string;
  readonly description: string;
  readonly mimeType: string;
  readonly createdAt: string;
}

export interface RegisterMcpToolInput {
  readonly name: string;
  readonly description?: string;
  readonly inputSchema?: unknown;
  readonly status?: "active" | "inactive";
}

export interface RegisterMcpResourceInput {
  readonly uri: string;
  readonly name: string;
  readonly description?: string;
  readonly mimeType?: string;
}

export interface HandleMcpRequestInput {
  readonly method: string;
  readonly params?: unknown;
  readonly toolId?: string;
  readonly resourceUri?: string;
}

export interface HandleMcpRequestResult {
  readonly requestId: string;
  readonly method: string;
  readonly response: unknown;
  readonly mock: boolean;
}

export interface McpRequestHistoryEntry {
  readonly requestId: string;
  readonly method: string;
  readonly input: unknown;
  readonly response: unknown;
  readonly mock: boolean;
  readonly createdAt: string;
}

export interface ListMcpToolsResult {
  readonly tools: readonly McpTool[];
  readonly total: number;
}

export interface ListMcpResourcesResult {
  readonly resources: readonly McpResource[];
  readonly total: number;
}

export interface GetMcpRequestHistoryResult {
  readonly entries: readonly McpRequestHistoryEntry[];
  readonly total: number;
}

export interface McpServerStatistics {
  readonly totalTools: number;
  readonly activeTools: number;
  readonly totalResources: number;
  readonly totalRequests: number;
}

export function createMcpTool(input: {
  toolId: string;
  name: string;
  description?: string;
  inputSchema?: unknown;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): McpTool {
  const now = new Date().toISOString();
  return Object.freeze({
    toolId: input.toolId,
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    inputSchema: input.inputSchema ?? Object.freeze({ type: "object", properties: {} }),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function createMcpResource(input: {
  resourceId: string;
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  createdAt?: string;
}): McpResource {
  return Object.freeze({
    resourceId: input.resourceId,
    uri: input.uri.trim(),
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    mimeType: (input.mimeType ?? "application/json").trim() || "application/json",
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}

export function createMcpRequestHistoryEntry(input: {
  requestId: string;
  method: string;
  input: unknown;
  response: unknown;
  mock: boolean;
  createdAt?: string;
}): McpRequestHistoryEntry {
  return Object.freeze({
    requestId: input.requestId,
    method: input.method.trim(),
    input: input.input,
    response: input.response,
    mock: input.mock,
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}
