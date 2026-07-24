import type { CompatibilityReport, MigrationPlan } from "@server/platform/evolution/evolution/models";

/** Contract for migration plan generation. */
export interface IMigrationPlanner {
  plan(targetVersion: string, strategyId: string): MigrationPlan;
}

export interface MigrationPlannerResult {
  readonly plan: MigrationPlan;
  readonly compatibility: CompatibilityReport;
}
