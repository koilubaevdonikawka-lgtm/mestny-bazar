export type ProjectionKind =
  | "future-state"
  | "impact"
  | "dependency"
  | "version";

/** Projected future state metadata. */
export interface ProjectionResult {
  readonly id: string;
  readonly kind: ProjectionKind;
  readonly baseSnapshotId: string;
  readonly generatedAt: string;
  readonly projections: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createProjectionResult(input: {
  id?: string;
  kind: ProjectionKind;
  baseSnapshotId: string;
  projections?: readonly string[];
  metadata?: Readonly<Record<string, unknown>>;
}): ProjectionResult {
  return Object.freeze({
    id: input.id ?? `projection-${Date.now()}`,
    kind: input.kind,
    baseSnapshotId: input.baseSnapshotId.trim(),
    generatedAt: new Date().toISOString(),
    projections: Object.freeze([...(input.projections ?? [])]),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
