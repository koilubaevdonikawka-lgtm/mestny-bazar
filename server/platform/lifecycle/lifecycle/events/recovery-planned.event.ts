import type { RecoveryPlan } from "@server/platform/lifecycle/lifecycle/models";

export interface RecoveryPlannedEvent {
  readonly type: "lifecycle.recovery.planned";
  readonly plan: RecoveryPlan;
}

export function createRecoveryPlannedEvent(plan: RecoveryPlan): RecoveryPlannedEvent {
  return Object.freeze({ type: "lifecycle.recovery.planned", plan });
}
