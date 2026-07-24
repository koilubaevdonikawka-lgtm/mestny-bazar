import type {
  LifecycleComponent,
  LifecycleReport,
  LifecycleState,
} from "@server/platform/lifecycle/lifecycle/models";

/** Contract for lifecycle orchestration. */
export interface ILifecycleManager {
  registerComponent(component: LifecycleComponent): LifecycleComponent;
  initialize(componentId: string): LifecycleState;
  start(componentId: string): LifecycleState;
  stop(componentId: string): LifecycleState;
  restart(componentId: string): LifecycleState;
  shutdown(componentId: string): LifecycleState;
  status(componentId?: string): LifecycleReport | LifecycleState;
}
