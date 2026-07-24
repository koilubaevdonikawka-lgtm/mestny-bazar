import type { IMigrationStrategy, StrategyPreparation } from "@server/platform/evolution/evolution/contracts";
import type { MigrationPlan } from "@server/platform/evolution/evolution/models";

/** Prepares forward-compatible migration strategy metadata. */
export class ForwardCompatibilityStrategy implements IMigrationStrategy {
  readonly id = "forward-compatibility";

  prepare(plan: MigrationPlan): StrategyPreparation {
    return Object.freeze({
      strategyId: this.id,
      name: "Forward Compatibility",
      description: "Prepare forward-compatible migration without breaking existing consumers.",
      phases: Object.freeze([
        "validate-forward-compatibility",
        "apply-migrations-in-order",
        "verify-module-api-stability",
      ]),
      rollbackSupported: true,
    });
  }
}

/** Prepares backward-compatible migration strategy metadata. */
export class BackwardCompatibilityStrategy implements IMigrationStrategy {
  readonly id = "backward-compatibility";

  prepare(plan: MigrationPlan): StrategyPreparation {
    return Object.freeze({
      strategyId: this.id,
      name: "Backward Compatibility",
      description: "Prepare backward-compatible migration preserving legacy interfaces.",
      phases: Object.freeze([
        "snapshot-current-state",
        "apply-compatible-migrations",
        "verify-legacy-consumers",
      ]),
      rollbackSupported: true,
    });
  }
}

/** Prepares rolling migration strategy metadata. */
export class RollingMigrationStrategy implements IMigrationStrategy {
  readonly id = "rolling-migration";

  prepare(plan: MigrationPlan): StrategyPreparation {
    return Object.freeze({
      strategyId: this.id,
      name: "Rolling Migration",
      description: "Prepare phased rolling migration across platform components.",
      phases: Object.freeze(
        plan.executionOrder.flatMap((migrationId) => [
          `prepare-${migrationId}`,
          `migrate-${migrationId}`,
          `verify-${migrationId}`,
        ]),
      ),
      rollbackSupported: true,
    });
  }
}

/** Prepares blue-green deployment strategy metadata. */
export class BlueGreenPreparationStrategy implements IMigrationStrategy {
  readonly id = "blue-green-preparation";

  prepare(plan: MigrationPlan): StrategyPreparation {
    return Object.freeze({
      strategyId: this.id,
      name: "Blue-Green Preparation",
      description: "Prepare blue-green environment switchover metadata (no deployment).",
      phases: Object.freeze([
        "prepare-green-environment",
        "sync-platform-metadata",
        "validate-green-readiness",
        "prepare-switchover-checklist",
      ]),
      rollbackSupported: true,
    });
  }
}

/** Prepares canary deployment strategy metadata. */
export class CanaryPreparationStrategy implements IMigrationStrategy {
  readonly id = "canary-preparation";

  prepare(plan: MigrationPlan): StrategyPreparation {
    return Object.freeze({
      strategyId: this.id,
      name: "Canary Preparation",
      description: "Prepare canary rollout metadata (no deployment).",
      phases: Object.freeze([
        "select-canary-scope",
        "prepare-canary-migrations",
        "define-success-criteria",
        "prepare-full-rollout-plan",
      ]),
      rollbackSupported: true,
    });
  }
}

export const DEFAULT_STRATEGY_ID = "forward-compatibility";
