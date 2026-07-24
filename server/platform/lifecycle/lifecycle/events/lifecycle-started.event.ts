import type { LifecycleState } from "@server/platform/lifecycle/lifecycle/models";

export interface LifecycleStartedEvent {
  readonly type: "lifecycle.started";
  readonly state: LifecycleState;
}

export function createLifecycleStartedEvent(state: LifecycleState): LifecycleStartedEvent {
  return Object.freeze({ type: "lifecycle.started", state });
}
