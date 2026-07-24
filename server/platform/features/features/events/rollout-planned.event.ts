import type { RolloutPlan } from "@server/platform/features/features/models";

export interface RolloutPlannedEvent {
  readonly type: "features.rollout.planned";
  readonly plan: RolloutPlan;
}

export function createRolloutPlannedEvent(plan: RolloutPlan): RolloutPlannedEvent {
  return Object.freeze({ type: "features.rollout.planned", plan });
}
