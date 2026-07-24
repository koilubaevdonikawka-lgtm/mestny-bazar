import type { IEvolutionManager } from "@server/platform/evolution/evolution/contracts";
import type { IMigrationRegistry } from "@server/platform/evolution/evolution/contracts";
import type { ICompatibilityEngine } from "@server/platform/evolution/evolution/contracts";
import type {
  CompatibilityReport,
  EvolutionResult,
  EvolutionValidationResult,
  MigrationDescriptor,
  MigrationPlan,
} from "@server/platform/evolution/evolution/models";

/** Public evolution platform facade. */
export class EvolutionPlatform {
  constructor(
    private readonly evolutionManager: IEvolutionManager,
    private readonly migrationRegistry: IMigrationRegistry,
    private readonly compatibilityEngine: ICompatibilityEngine,
  ) {}

  registerMigration(migration: MigrationDescriptor): void {
    this.migrationRegistry.register(migration);
  }

  planEvolution(targetVersion: string, strategyId?: string): MigrationPlan {
    return this.evolutionManager.planEvolution(targetVersion, strategyId);
  }

  validateEvolution(planId: string): Promise<EvolutionValidationResult> {
    return this.evolutionManager.validateEvolution(planId);
  }

  executePlan(planId: string): Promise<EvolutionResult> {
    return this.evolutionManager.executeEvolutionPlan(planId);
  }

  rollbackPlan(planId: string): EvolutionResult {
    return this.evolutionManager.rollbackPlan(planId);
  }

  compatibilityReport(targetVersion: string): CompatibilityReport {
    return this.compatibilityEngine.assess(targetVersion);
  }

  listMigrations(): readonly MigrationDescriptor[] {
    return this.migrationRegistry.list();
  }
}
