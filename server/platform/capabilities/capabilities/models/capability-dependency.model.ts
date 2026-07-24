/** Capability dependency metadata. */
export interface CapabilityDependency {
  readonly capabilityId: string;
  readonly required: readonly string[];
  readonly optional: readonly string[];
  readonly transitive: readonly string[];
  readonly resolvedAt: string;
}

export function createCapabilityDependency(input: {
  capabilityId: string;
  required?: readonly string[];
  optional?: readonly string[];
  transitive?: readonly string[];
}): CapabilityDependency {
  return Object.freeze({
    capabilityId: input.capabilityId.trim(),
    required: Object.freeze([...(input.required ?? [])]),
    optional: Object.freeze([...(input.optional ?? [])]),
    transitive: Object.freeze([...(input.transitive ?? [])]),
    resolvedAt: new Date().toISOString(),
  });
}
