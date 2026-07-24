/** Active governance session metadata. */
export interface GovernanceSession {
  readonly id: string;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly status: "active" | "completed";
  readonly platformCount: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createGovernanceSession(input: {
  id?: string;
  platformCount?: number;
  status?: GovernanceSession["status"];
  metadata?: Readonly<Record<string, unknown>>;
}): GovernanceSession {
  return Object.freeze({
    id: input.id ?? `session-${Date.now()}`,
    startedAt: new Date().toISOString(),
    completedAt: input.status === "completed" ? new Date().toISOString() : undefined,
    status: input.status ?? "active",
    platformCount: input.platformCount ?? 0,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
