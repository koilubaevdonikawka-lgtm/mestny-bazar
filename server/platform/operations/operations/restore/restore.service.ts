import type { IRestoreService } from "@server/platform/operations/operations/contracts";
import type { IBackupService } from "@server/platform/operations/operations/contracts";
import { createRestoreDescriptor, type RestoreDescriptor } from "@server/platform/operations/operations/models";
import { createRestoreCompletedEvent } from "@server/platform/operations/operations/events";

/** Restores platform state from backup snapshots. */
export class RestoreService implements IRestoreService {
  private readonly restoredSnapshots = new Map<string, Readonly<Record<string, unknown>>>();

  constructor(private readonly backupService: IBackupService) {}

  restore(backupId: string): RestoreDescriptor {
    const backup = this.backupService.getBackup(backupId);
    if (!backup) {
      const descriptor = createRestoreDescriptor({
        backupId,
        kinds: [],
        restored: [],
        skipped: ["backup-not-found"],
      });
      createRestoreCompletedEvent(descriptor);
      return descriptor;
    }

    const restored: string[] = [];
    const skipped: string[] = [];

    for (const kind of backup.kinds) {
      const snapshot = backup.snapshots[kind];
      if (snapshot !== undefined) {
        this.restoredSnapshots.set(`${backupId}:${kind}`, snapshot as Readonly<Record<string, unknown>>);
        restored.push(kind);
      } else {
        skipped.push(kind);
      }
    }

    const descriptor = createRestoreDescriptor({
      backupId,
      kinds: backup.kinds,
      restored,
      skipped,
    });
    createRestoreCompletedEvent(descriptor);
    return descriptor;
  }

  getRestoredSnapshot(backupId: string, kind: string): Readonly<Record<string, unknown>> | undefined {
    return this.restoredSnapshots.get(`${backupId.trim()}:${kind}`);
  }
}
