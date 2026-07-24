import type { BackupDescriptor } from "@server/platform/operations/operations/models";

/** Contract for platform backup operations. */
export interface IBackupService {
  backup(): Promise<BackupDescriptor> | BackupDescriptor;
  listBackups(): readonly BackupDescriptor[];
  getBackup(backupId: string): BackupDescriptor | undefined;
}
