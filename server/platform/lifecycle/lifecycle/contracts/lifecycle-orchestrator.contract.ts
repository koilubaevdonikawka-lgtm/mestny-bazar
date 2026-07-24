import type {
  LifecycleComponent,
  OrchestrationOrder,
  OrchestrationOrderKind,
} from "@server/platform/lifecycle/lifecycle/models";

/** Contract for lifecycle orchestration order metadata. */
export interface ILifecycleOrchestrator {
  resolveOrder(
    kind: OrchestrationOrderKind,
    components: readonly LifecycleComponent[],
  ): OrchestrationOrder;
  startupOrder(components: readonly LifecycleComponent[]): OrchestrationOrder;
  shutdownOrder(components: readonly LifecycleComponent[]): OrchestrationOrder;
  dependencyOrder(components: readonly LifecycleComponent[]): OrchestrationOrder;
  restartOrder(components: readonly LifecycleComponent[]): OrchestrationOrder;
}
