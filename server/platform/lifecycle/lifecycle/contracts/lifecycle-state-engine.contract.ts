import type {
  LifecycleState,
  LifecycleStateValue,
} from "@server/platform/lifecycle/lifecycle/models";

/** Contract for lifecycle state management. */
export interface ILifecycleStateEngine {
  getState(componentId: string): LifecycleState | undefined;
  setState(componentId: string, state: LifecycleStateValue): LifecycleState;
  listStates(): readonly LifecycleState[];
}
