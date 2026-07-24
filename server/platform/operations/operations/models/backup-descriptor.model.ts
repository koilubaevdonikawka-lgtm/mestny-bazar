export type BackupSnapshotKind =
  | "configuration"
  | "documentation"
  | "governance"
  | "runtime"
  | "provider-registry";

/** Descriptor for a platform backup snapshot. */
export interface BackupDescriptor {
  readonly id: string;
  readonly createdAt: string;
  readonly kinds: readonly BackupSnapshotKind[];
  readonly snapshots: Readonly<Record<string, unknown>>;
}

export function createBackupDescriptor(input: {
  id?: string;
  kinds: readonly BackupSnapshotKind[];
  snapshots: Readonly<Record<string, unknown>>;
}): BackupDescriptor {
  return Object.freeze({
    id: input.id ?? `backup-${Date.now()}`,
    createdAt: new Date().toISOString(),
    kinds: Object.freeze([...input.kinds]),
    snapshots: Object.freeze({ ...input.snapshots }),
  });
}
