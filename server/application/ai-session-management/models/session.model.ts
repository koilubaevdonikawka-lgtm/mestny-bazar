/** AI session — generic session metadata only, no domain knowledge. */
export interface Session {
  readonly sessionId: string;
  readonly name: string;
  readonly description: string;
  readonly status: "active" | "closed";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly closedAt: string | null;
}

export interface CreateSessionInput {
  readonly name: string;
  readonly description?: string;
  readonly status?: "active" | "closed";
}

export interface UpdateSessionInput {
  readonly sessionId: string;
  readonly name?: string;
  readonly description?: string;
  readonly status?: "active" | "closed";
}

export interface ListSessionsResult {
  readonly sessions: readonly Session[];
  readonly total: number;
}

export interface FindSessionByNameResult {
  readonly session: Session | null;
}

export interface ListSessionsByStatusResult {
  readonly sessions: readonly Session[];
  readonly total: number;
  readonly status: string;
}

export interface CloseSessionResult {
  readonly sessionId: string;
  readonly closed: boolean;
}

export interface SessionStatistics {
  readonly totalSessions: number;
  readonly activeSessions: number;
  readonly closedSessions: number;
}

export function createSession(input: {
  sessionId: string;
  name: string;
  description?: string;
  status?: "active" | "closed";
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string | null;
}): Session {
  const now = new Date().toISOString();
  const status = input.status ?? "active";
  return Object.freeze({
    sessionId: input.sessionId,
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    status,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    closedAt: input.closedAt ?? (status === "closed" ? now : null),
  });
}
