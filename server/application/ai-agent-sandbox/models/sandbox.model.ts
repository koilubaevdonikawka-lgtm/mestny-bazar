/** Registered sandbox environment — generic metadata only, no domain knowledge. */
export interface Sandbox {
  readonly sandboxId: string;
  readonly name: string;
  readonly description: string;
  readonly isolationLevel: "strict" | "standard" | "relaxed";
  readonly config: unknown;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Created sandbox session — mock lifecycle only. */
export interface SandboxSession {
  readonly sessionId: string;
  readonly sandboxId: string;
  readonly name: string;
  readonly status: "created" | "running" | "terminated";
  readonly config: unknown;
  readonly mock: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterSandboxInput {
  readonly name: string;
  readonly description?: string;
  readonly isolationLevel?: "strict" | "standard" | "relaxed";
  readonly config?: unknown;
  readonly status?: "active" | "inactive";
}

export interface UpdateSandboxInput {
  readonly sandboxId: string;
  readonly name?: string;
  readonly description?: string;
  readonly isolationLevel?: "strict" | "standard" | "relaxed";
  readonly config?: unknown;
  readonly status?: "active" | "inactive";
}

export interface CreateSandboxSessionInput {
  readonly sandboxId: string;
  readonly name: string;
  readonly config?: unknown;
}

export interface ListSandboxesResult {
  readonly sandboxes: readonly Sandbox[];
  readonly total: number;
}

export interface ListSandboxSessionsResult {
  readonly sessions: readonly SandboxSession[];
  readonly total: number;
}

export interface DeleteSandboxResult {
  readonly sandboxId: string;
  readonly deleted: boolean;
}

export interface SandboxStatistics {
  readonly totalSandboxes: number;
  readonly activeSandboxes: number;
  readonly totalSessions: number;
  readonly runningSessions: number;
}

export function createSandbox(input: {
  sandboxId: string;
  name: string;
  description?: string;
  isolationLevel?: "strict" | "standard" | "relaxed";
  config?: unknown;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Sandbox {
  const now = new Date().toISOString();
  return Object.freeze({
    sandboxId: input.sandboxId,
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    isolationLevel: input.isolationLevel ?? "standard",
    config: input.config ?? Object.freeze({}),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function createSandboxSession(input: {
  sessionId: string;
  sandboxId: string;
  name: string;
  status?: "created" | "running" | "terminated";
  config?: unknown;
  mock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}): SandboxSession {
  const now = new Date().toISOString();
  return Object.freeze({
    sessionId: input.sessionId,
    sandboxId: input.sandboxId,
    name: input.name.trim(),
    status: input.status ?? "created",
    config: input.config ?? Object.freeze({}),
    mock: input.mock ?? true,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
