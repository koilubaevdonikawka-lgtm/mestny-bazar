/** Descriptor for a restore operation from a backup snapshot. */
export interface RestoreDescriptor {
  readonly backupId: string;
  readonly requestedAt: string;
  readonly kinds: readonly string[];
  readonly restored: readonly string[];
  readonly skipped: readonly string[];
}

export function createRestoreDescriptor(input: {
  backupId: string;
  kinds?: readonly string[];
  restored?: readonly string[];
  skipped?: readonly string[];
}): RestoreDescriptor {
  return Object.freeze({
    backupId: input.backupId.trim(),
    requestedAt: new Date().toISOString(),
    kinds: Object.freeze([...(input.kinds ?? [])]),
    restored: Object.freeze([...(input.restored ?? [])]),
    skipped: Object.freeze([...(input.skipped ?? [])]),
  });
}
