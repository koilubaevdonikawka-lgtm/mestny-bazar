import type { MigrationPlan } from "./migration-plan.model";

export type EvolutionStatus = "planned" | "validated" | "executed" | "rolled-back" | "failed";

/** Result of an evolution operation. */
export interface EvolutionResult {
  readonly planId: string;
  readonly status: EvolutionStatus;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly summary: string;
  readonly executedSteps: readonly string[];
  readonly skippedSteps: readonly string[];
  readonly plan?: MigrationPlan;
}

export function createEvolutionResult(input: {
  planId: string;
  status: EvolutionStatus;
  startedAt: string;
  summary: string;
  executedSteps?: readonly string[];
  skippedSteps?: readonly string[];
  plan?: MigrationPlan;
}): EvolutionResult {
  return Object.freeze({
    planId: input.planId.trim(),
    status: input.status,
    startedAt: input.startedAt,
    completedAt: new Date().toISOString(),
    summary: input.summary.trim(),
    executedSteps: Object.freeze([...(input.executedSteps ?? [])]),
    skippedSteps: Object.freeze([...(input.skippedSteps ?? [])]),
    plan: input.plan,
  });
}
