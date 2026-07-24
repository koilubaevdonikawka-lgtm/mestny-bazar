export type SnapshotKind =
  | "platform"
  | "capability"
  | "knowledge"
  | "configuration";

/** Immutable platform state snapshot (metadata only). */
export interface PlatformSnapshot {
  readonly id: string;
  readonly kind: SnapshotKind;
  readonly label: string;
  readonly capturedAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly twinIds: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createPlatformSnapshot(input: {
  id?: string;
  kind: SnapshotKind;
  label?: string;
  payload?: Readonly<Record<string, unknown>>;
  twinIds?: readonly string[];
  metadata?: Readonly<Record<string, unknown>>;
}): PlatformSnapshot {
  return Object.freeze({
    id: input.id ?? `snapshot-${Date.now()}`,
    kind: input.kind,
    label: input.label?.trim() ?? `${input.kind}-snapshot`,
    capturedAt: new Date().toISOString(),
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    twinIds: Object.freeze([...(input.twinIds ?? [])]),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
