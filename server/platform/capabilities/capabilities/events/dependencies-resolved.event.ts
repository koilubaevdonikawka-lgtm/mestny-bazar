import type { CapabilityDependency } from "@server/platform/capabilities/capabilities/models";

export interface DependenciesResolvedEvent {
  readonly type: "capabilities.dependencies.resolved";
  readonly dependency: CapabilityDependency;
}

export function createDependenciesResolvedEvent(
  dependency: CapabilityDependency,
): DependenciesResolvedEvent {
  return Object.freeze({ type: "capabilities.dependencies.resolved", dependency });
}
