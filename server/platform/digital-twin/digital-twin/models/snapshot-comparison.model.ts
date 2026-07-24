export type ComparisonKind =
  | "snapshot"
  | "capability"
  | "dependency"
  | "knowledge";

/** Snapshot comparison diff metadata. */
export interface SnapshotComparison {
  readonly id: string;
  readonly kind: ComparisonKind;
  readonly sourceSnapshotId: string;
  readonly targetSnapshotId: string;
  readonly comparedAt: string;
  readonly added: readonly string[];
  readonly removed: readonly string[];
  readonly changed: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createSnapshotComparison(input: {
  id?: string;
  kind: ComparisonKind;
  sourceSnapshotId: string;
  targetSnapshotId: string;
  added?: readonly string[];
  removed?: readonly string[];
  changed?: readonly string[];
  metadata?: Readonly<Record<string, unknown>>;
}): SnapshotComparison {
  return Object.freeze({
    id: input.id ?? `comparison-${Date.now()}`,
    kind: input.kind,
    sourceSnapshotId: input.sourceSnapshotId.trim(),
    targetSnapshotId: input.targetSnapshotId.trim(),
    comparedAt: new Date().toISOString(),
    added: Object.freeze([...(input.added ?? [])]),
    removed: Object.freeze([...(input.removed ?? [])]),
    changed: Object.freeze([...(input.changed ?? [])]),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
