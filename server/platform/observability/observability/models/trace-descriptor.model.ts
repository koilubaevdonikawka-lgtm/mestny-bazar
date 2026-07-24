/** Trace metadata descriptor. */
export interface TraceDescriptor {
  readonly id: string;
  readonly name: string;
  readonly startedAt: string;
  readonly finishedAt?: string;
  readonly spanCount: number;
  readonly status: "active" | "completed";
}

export function createTraceDescriptor(input: {
  id?: string;
  name: string;
  spanCount?: number;
  status?: "active" | "completed";
  startedAt?: string;
  finishedAt?: string;
}): TraceDescriptor {
  return Object.freeze({
    id: input.id ?? `trace-${Date.now()}`,
    name: input.name.trim(),
    startedAt: input.startedAt ?? new Date().toISOString(),
    finishedAt: input.finishedAt,
    spanCount: input.spanCount ?? 0,
    status: input.status ?? "active",
  });
}
