import type { IMigrationPlanner } from "@server/platform/evolution/evolution/contracts";
import type { IMigrationRegistry } from "@server/platform/evolution/evolution/contracts";
import type { ICompatibilityEngine } from "@server/platform/evolution/evolution/contracts";
import {
  createMigrationPlan,
  createMigrationStep,
  type MigrationPlan,
} from "@server/platform/evolution/evolution/models";
import { createEvolutionPlannedEvent } from "@server/platform/evolution/evolution/events";

/** Forms migration plans with execution order from registered migrations. */
export class MigrationPlanner implements IMigrationPlanner {
  constructor(
    private readonly registry: IMigrationRegistry,
    private readonly compatibilityEngine: ICompatibilityEngine,
  ) {}

  plan(targetVersion: string, strategyId: string): MigrationPlan {
    const migrations = this.registry
      .list()
      .filter((migration) => migration.toVersion === targetVersion);

    const steps = migrations.map((migration, index) =>
      createMigrationStep({
        order: index + 1,
        migrationId: migration.id,
        migrationName: migration.name,
        kind: migration.kind,
        fromVersion: migration.fromVersion,
        toVersion: migration.toVersion,
      }),
    );

    const executionOrder = Object.freeze([
      ...steps
        .slice()
        .sort((left, right) => {
          const kindOrder: Record<string, number> = {
            documentation: 1,
            contract: 2,
            configuration: 3,
            provider: 4,
            platform: 5,
          };
          return (kindOrder[left.kind] ?? 99) - (kindOrder[right.kind] ?? 99);
        })
        .map((step) => step.migrationId),
    ]);

    const plan = createMigrationPlan({
      targetVersion,
      strategyId,
      steps,
      executionOrder,
    });

    this.compatibilityEngine.assess(targetVersion);
    createEvolutionPlannedEvent(plan);
    return plan;
  }
}
