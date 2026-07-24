import type { DecisionDescriptor } from "./decision-descriptor.model";

export type DecisionOutcome = "approve" | "reject" | "defer" | "review";

/** Decision outcome metadata. */
export interface DecisionResult {
  readonly id: string;
  readonly descriptor: DecisionDescriptor;
  readonly outcome: DecisionOutcome;
  readonly decidedAt: string;
  readonly summary: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createDecisionResult(input: {
  id?: string;
  descriptor: DecisionDescriptor;
  outcome: DecisionOutcome;
  summary?: string;
  metadata?: Readonly<Record<string, unknown>>;
}): DecisionResult {
  return Object.freeze({
    id: input.id ?? `result-${Date.now()}`,
    descriptor: input.descriptor,
    outcome: input.outcome,
    decidedAt: new Date().toISOString(),
    summary: input.summary?.trim() ?? "",
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
