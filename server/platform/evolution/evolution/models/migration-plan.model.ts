import type { MigrationStep } from "./migration-step.model";

/** Planned migration execution order. */
export interface MigrationPlan {
  readonly id: string;
  readonly plannedAt: string;
  readonly targetVersion: string;
  readonly strategyId: string;
  readonly steps: readonly MigrationStep[];
  readonly executionOrder: readonly string[];
}

export function createMigrationPlan(input: {
  id?: string;
  targetVersion: string;
  strategyId: string;
  steps: readonly MigrationStep[];
  executionOrder?: readonly string[];
}): MigrationPlan {
  const executionOrder =
    input.executionOrder ?? input.steps.map((step) => step.migrationId);
  return Object.freeze({
    id: input.id ?? `plan-${Date.now()}`,
    plannedAt: new Date().toISOString(),
    targetVersion: input.targetVersion.trim(),
    strategyId: input.strategyId.trim(),
    steps: Object.freeze([...input.steps]),
    executionOrder: Object.freeze([...executionOrder]),
  });
}
