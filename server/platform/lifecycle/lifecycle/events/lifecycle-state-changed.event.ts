import type { LifecycleTransition } from "@server/platform/lifecycle/lifecycle/models";

export interface LifecycleStateChangedEvent {
  readonly type: "lifecycle.state.changed";
  readonly transition: LifecycleTransition;
}

export function createLifecycleStateChangedEvent(
  transition: LifecycleTransition,
): LifecycleStateChangedEvent {
  return Object.freeze({ type: "lifecycle.state.changed", transition });
}
