import type { MigrationPlan } from "@server/platform/evolution/evolution/models";

export interface StrategyPreparation {
  readonly strategyId: string;
  readonly name: string;
  readonly description: string;
  readonly phases: readonly string[];
  readonly rollbackSupported: boolean;
}

/** Contract for migration strategy preparation (no deployment). */
export interface IMigrationStrategy {
  readonly id: string;
  prepare(plan: MigrationPlan): StrategyPreparation;
}
