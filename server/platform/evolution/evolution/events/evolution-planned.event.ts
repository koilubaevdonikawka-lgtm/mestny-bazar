import type { MigrationPlan } from "@server/platform/evolution/evolution/models";

/** Emitted when an evolution plan is created. */
export interface EvolutionPlannedEvent {
  readonly type: "evolution.planned";
  readonly plan: MigrationPlan;
}

export function createEvolutionPlannedEvent(plan: MigrationPlan): EvolutionPlannedEvent {
  return Object.freeze({ type: "evolution.planned", plan });
}
