import type {
  LifecycleStateValue,
  LifecycleTransition,
} from "@server/platform/lifecycle/lifecycle/models";

/** Contract for lifecycle transition metadata (no business actions). */
export interface ILifecycleTransitionEngine {
  validateTransition(from: LifecycleStateValue, to: LifecycleStateValue): boolean;
  performTransition(
    componentId: string,
    from: LifecycleStateValue,
    to: LifecycleStateValue,
  ): LifecycleTransition;
  rollbackTransition(
    componentId: string,
    from: LifecycleStateValue,
    to: LifecycleStateValue,
  ): LifecycleTransition;
}
