import type { BackupDescriptor } from "@server/platform/operations/operations/models";

/** Emitted when a backup completes. */
export interface BackupCompletedEvent {
  readonly type: "operations.backup.completed";
  readonly backup: BackupDescriptor;
}

export function createBackupCompletedEvent(backup: BackupDescriptor): BackupCompletedEvent {
  return Object.freeze({ type: "operations.backup.completed", backup });
}
