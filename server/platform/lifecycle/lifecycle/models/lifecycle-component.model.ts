export type LifecycleComponentKind =
  | "component"
  | "service"
  | "registry"
  | "manager"
  | "provider";

/** Registered platform lifecycle component metadata. */
export interface LifecycleComponent {
  readonly id: string;
  readonly name: string;
  readonly kind: LifecycleComponentKind;
  readonly platformId: string;
  readonly dependencies: readonly string[];
  readonly registeredAt: string;
}

export function createLifecycleComponent(input: {
  id?: string;
  name: string;
  kind: LifecycleComponentKind;
  platformId: string;
  dependencies?: readonly string[];
}): LifecycleComponent {
  return Object.freeze({
    id: input.id ?? `component-${Date.now()}`,
    name: input.name.trim(),
    kind: input.kind,
    platformId: input.platformId.trim(),
    dependencies: Object.freeze([...(input.dependencies ?? [])]),
    registeredAt: new Date().toISOString(),
  });
}
