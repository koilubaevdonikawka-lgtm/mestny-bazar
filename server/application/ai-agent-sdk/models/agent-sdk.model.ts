/** Registered agent SDK — generic metadata only, no domain knowledge. */
export interface AgentSdk {
  readonly sdkId: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly capabilities: readonly string[];
  readonly config: unknown;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Created agent instance — mock lifecycle only. */
export interface AgentInstance {
  readonly instanceId: string;
  readonly sdkId: string;
  readonly name: string;
  readonly status: "created" | "running" | "stopped";
  readonly config: unknown;
  readonly mock: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterAgentSdkInput {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly capabilities?: readonly string[];
  readonly config?: unknown;
  readonly status?: "active" | "inactive";
}

export interface UpdateAgentSdkInput {
  readonly sdkId: string;
  readonly name?: string;
  readonly version?: string;
  readonly description?: string;
  readonly capabilities?: readonly string[];
  readonly config?: unknown;
  readonly status?: "active" | "inactive";
}

export interface CreateAgentInstanceInput {
  readonly sdkId: string;
  readonly name: string;
  readonly config?: unknown;
}

export interface ListAgentSdksResult {
  readonly sdks: readonly AgentSdk[];
  readonly total: number;
}

export interface ListAgentInstancesResult {
  readonly instances: readonly AgentInstance[];
  readonly total: number;
}

export interface DeleteAgentSdkResult {
  readonly sdkId: string;
  readonly deleted: boolean;
}

export interface AgentSdkStatistics {
  readonly totalSdks: number;
  readonly activeSdks: number;
  readonly totalInstances: number;
  readonly runningInstances: number;
}

export function createAgentSdk(input: {
  sdkId: string;
  name: string;
  version: string;
  description?: string;
  capabilities?: readonly string[];
  config?: unknown;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): AgentSdk {
  const now = new Date().toISOString();
  return Object.freeze({
    sdkId: input.sdkId,
    name: input.name.trim(),
    version: input.version.trim(),
    description: (input.description ?? "").trim(),
    capabilities: Object.freeze(
      (input.capabilities ?? []).map((capability) => capability.trim()).filter(Boolean),
    ),
    config: input.config ?? Object.freeze({}),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function createAgentInstance(input: {
  instanceId: string;
  sdkId: string;
  name: string;
  status?: "created" | "running" | "stopped";
  config?: unknown;
  mock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}): AgentInstance {
  const now = new Date().toISOString();
  return Object.freeze({
    instanceId: input.instanceId,
    sdkId: input.sdkId,
    name: input.name.trim(),
    status: input.status ?? "created",
    config: input.config ?? Object.freeze({}),
    mock: input.mock ?? true,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
