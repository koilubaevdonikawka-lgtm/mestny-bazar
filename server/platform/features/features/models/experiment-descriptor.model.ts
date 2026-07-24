export type ExperimentKind = "a-b" | "canary" | "beta";

/** Experiment metadata descriptor. */
export interface ExperimentDescriptor {
  readonly id: string;
  readonly name: string;
  readonly kind: ExperimentKind;
  readonly featureIds: readonly string[];
  readonly active: boolean;
  readonly registeredAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createExperimentDescriptor(input: {
  id?: string;
  name: string;
  kind: ExperimentKind;
  featureIds?: readonly string[];
  active?: boolean;
  metadata?: Readonly<Record<string, unknown>>;
}): ExperimentDescriptor {
  return Object.freeze({
    id: input.id ?? `experiment-${Date.now()}`,
    name: input.name.trim(),
    kind: input.kind,
    featureIds: Object.freeze([...(input.featureIds ?? [])]),
    active: input.active ?? false,
    registeredAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
