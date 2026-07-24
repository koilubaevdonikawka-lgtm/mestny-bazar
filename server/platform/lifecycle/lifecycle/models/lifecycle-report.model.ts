import type { LifecycleState } from "./lifecycle-state.model";

/** Lifecycle status report metadata. */
export interface LifecycleReport {
  readonly id: string;
  readonly generatedAt: string;
  readonly total: number;
  readonly running: number;
  readonly failed: number;
  readonly states: readonly LifecycleState[];
  readonly summary: string;
}

export function createLifecycleReport(input: {
  id?: string;
  states: readonly LifecycleState[];
  summary?: string;
}): LifecycleReport {
  const running = input.states.filter((state) => state.state === "running").length;
  const failed = input.states.filter((state) => state.state === "failed").length;
  return Object.freeze({
    id: input.id ?? `lifecycle-report-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    total: input.states.length,
    running,
    failed,
    states: Object.freeze([...input.states]),
    summary: input.summary?.trim() ?? "",
  });
}

export type OrchestrationOrderKind = "startup" | "shutdown" | "dependency" | "restart";

export interface OrchestrationOrder {
  readonly kind: OrchestrationOrderKind;
  readonly componentIds: readonly string[];
  readonly resolvedAt: string;
}

export function createOrchestrationOrder(input: {
  kind: OrchestrationOrderKind;
  componentIds: readonly string[];
}): OrchestrationOrder {
  return Object.freeze({
    kind: input.kind,
    componentIds: Object.freeze([...input.componentIds]),
    resolvedAt: new Date().toISOString(),
  });
}
