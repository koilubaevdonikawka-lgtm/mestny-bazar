export type CapabilityKind =
  | "platform"
  | "module"
  | "provider"
  | "sdk"
  | "gateway";

/** Registered capability metadata descriptor. */
export interface CapabilityDescriptor {
  readonly id: string;
  readonly name: string;
  readonly kind: CapabilityKind;
  readonly version: string;
  readonly description: string;
  readonly dependencies: readonly string[];
  readonly registeredAt: string;
}

export function createCapabilityDescriptor(input: {
  id?: string;
  name: string;
  kind: CapabilityKind;
  version?: string;
  description?: string;
  dependencies?: readonly string[];
}): CapabilityDescriptor {
  return Object.freeze({
    id: input.id ?? `capability-${Date.now()}`,
    name: input.name.trim(),
    kind: input.kind,
    version: input.version?.trim() || "1.0.0",
    description: input.description?.trim() ?? "",
    dependencies: Object.freeze([...(input.dependencies ?? [])]),
    registeredAt: new Date().toISOString(),
  });
}
