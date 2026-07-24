import type { ICapabilityDependencyEngine } from "@server/platform/capabilities/capabilities/contracts";
import {
  createCapabilityDependency,
  type CapabilityDependency,
  type CapabilityDescriptor,
} from "@server/platform/capabilities/capabilities/models";
import { createDependenciesResolvedEvent } from "@server/platform/capabilities/capabilities/events";

/** Resolves capability dependency metadata (no side effects). */
export class CapabilityDependencyEngine implements ICapabilityDependencyEngine {
  resolve(
    capability: CapabilityDescriptor,
    all: readonly CapabilityDescriptor[],
  ): CapabilityDependency {
    const required = capability.dependencies.filter((dependency) =>
      all.some((entry) => entry.id === dependency),
    );
    const optional = all
      .filter((entry) => entry.kind === capability.kind && entry.id !== capability.id)
      .map((entry) => entry.id)
      .slice(0, 3);
    const transitive = this.collectTransitive(capability.id, all);

    const dependency = createCapabilityDependency({
      capabilityId: capability.id,
      required,
      optional,
      transitive,
    });
    createDependenciesResolvedEvent(dependency);
    return dependency;
  }

  buildGraph(
    capabilities: readonly CapabilityDescriptor[],
  ): Readonly<Record<string, readonly string[]>> {
    const graph: Record<string, readonly string[]> = {};
    for (const capability of capabilities) {
      graph[capability.id] = this.resolve(capability, capabilities).transitive;
    }
    return Object.freeze(graph);
  }

  private collectTransitive(
    capabilityId: string,
    all: readonly CapabilityDescriptor[],
    visited: readonly string[] = [],
  ): readonly string[] {
    const capability = all.find((entry) => entry.id === capabilityId);
    if (!capability || visited.includes(capabilityId)) {
      return Object.freeze([]);
    }
    const nextVisited = Object.freeze([...visited, capabilityId]);
    const transitive = new Set<string>(capability.dependencies);
    for (const dependency of capability.dependencies) {
      for (const nested of this.collectTransitive(dependency, all, nextVisited)) {
        transitive.add(nested);
      }
    }
    return Object.freeze([...transitive]);
  }
}
