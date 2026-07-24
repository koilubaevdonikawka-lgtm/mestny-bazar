import type {
  EvolutionResult,
  EvolutionValidationResult,
  MigrationPlan,
} from "@server/platform/evolution/evolution/models";

/** Contract for evolution lifecycle orchestration. */
export interface IEvolutionManager {
  planEvolution(targetVersion: string, strategyId?: string): MigrationPlan;
  executeEvolutionPlan(planId: string): Promise<EvolutionResult> | EvolutionResult;
  validateEvolution(planId: string): Promise<EvolutionValidationResult> | EvolutionValidationResult;
  rollbackPlan(planId: string): EvolutionResult;
}
