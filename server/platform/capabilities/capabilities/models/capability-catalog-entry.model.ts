import type { CapabilityAvailability } from "./capability-availability.model";
import type { CapabilityCompatibility } from "./capability-compatibility.model";
import type { CapabilityDependency } from "./capability-dependency.model";
import type { CapabilityDescriptor } from "./capability-descriptor.model";

/** Single capability catalog entry. */
export interface CapabilityCatalogEntry {
  readonly capability: CapabilityDescriptor;
  readonly dependency: CapabilityDependency;
  readonly compatibility: CapabilityCompatibility;
  readonly availability: CapabilityAvailability;
}

export function createCapabilityCatalogEntry(input: {
  capability: CapabilityDescriptor;
  dependency: CapabilityDependency;
  compatibility: CapabilityCompatibility;
  availability: CapabilityAvailability;
}): CapabilityCatalogEntry {
  return Object.freeze({
    capability: input.capability,
    dependency: input.dependency,
    compatibility: input.compatibility,
    availability: input.availability,
  });
}

export interface CapabilityCatalog {
  readonly id: string;
  readonly generatedAt: string;
  readonly entries: readonly CapabilityCatalogEntry[];
  readonly dependencyMap: Readonly<Record<string, readonly string[]>>;
  readonly compatibilityMatrix: Readonly<Record<string, boolean>>;
  readonly availabilityReport: Readonly<Record<string, CapabilityAvailability["status"]>>;
}

export function createCapabilityCatalog(input: {
  id?: string;
  entries: readonly CapabilityCatalogEntry[];
  dependencyMap: Readonly<Record<string, readonly string[]>>;
  compatibilityMatrix: Readonly<Record<string, boolean>>;
  availabilityReport: Readonly<Record<string, CapabilityAvailability["status"]>>;
}): CapabilityCatalog {
  return Object.freeze({
    id: input.id ?? `capability-catalog-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    entries: Object.freeze([...input.entries]),
    dependencyMap: Object.freeze({ ...input.dependencyMap }),
    compatibilityMatrix: Object.freeze({ ...input.compatibilityMatrix }),
    availabilityReport: Object.freeze({ ...input.availabilityReport }),
  });
}
