import type { ILifecycleOrchestrator } from "@server/platform/lifecycle/lifecycle/contracts";
import {
  createOrchestrationOrder,
  type LifecycleComponent,
  type OrchestrationOrder,
  type OrchestrationOrderKind,
} from "@server/platform/lifecycle/lifecycle/models";

/** Resolves lifecycle orchestration order metadata (no business actions). */
export class LifecycleOrchestrator implements ILifecycleOrchestrator {
  resolveOrder(
    kind: OrchestrationOrderKind,
    components: readonly LifecycleComponent[],
  ): OrchestrationOrder {
    switch (kind) {
      case "startup":
        return this.startupOrder(components);
      case "shutdown":
        return this.shutdownOrder(components);
      case "dependency":
        return this.dependencyOrder(components);
      case "restart":
        return this.restartOrder(components);
      default:
        return createOrchestrationOrder({ kind, componentIds: components.map((c) => c.id) });
    }
  }

  startupOrder(components: readonly LifecycleComponent[]): OrchestrationOrder {
    return createOrchestrationOrder({
      kind: "startup",
      componentIds: this.sortByDependencies(components),
    });
  }

  shutdownOrder(components: readonly LifecycleComponent[]): OrchestrationOrder {
    return createOrchestrationOrder({
      kind: "shutdown",
      componentIds: [...this.sortByDependencies(components)].reverse(),
    });
  }

  dependencyOrder(components: readonly LifecycleComponent[]): OrchestrationOrder {
    return createOrchestrationOrder({
      kind: "dependency",
      componentIds: this.sortByDependencies(components),
    });
  }

  restartOrder(components: readonly LifecycleComponent[]): OrchestrationOrder {
    const shutdown = this.shutdownOrder(components).componentIds;
    const startup = this.startupOrder(components).componentIds;
    return createOrchestrationOrder({
      kind: "restart",
      componentIds: Object.freeze([...shutdown, ...startup]),
    });
  }

  private sortByDependencies(components: readonly LifecycleComponent[]): readonly string[] {
    const sorted: string[] = [];
    const pending = [...components];

    while (pending.length > 0) {
      const nextIndex = pending.findIndex((component) =>
        component.dependencies.every((dependency) => sorted.includes(dependency)),
      );
      const index = nextIndex >= 0 ? nextIndex : 0;
      sorted.push(pending[index].id);
      pending.splice(index, 1);
    }

    return Object.freeze(sorted);
  }
}
