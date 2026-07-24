import type { IMaintenanceEngine } from "@server/platform/operations/operations/contracts";
import type { ICleanupService } from "@server/platform/operations/operations/contracts";
import type { IBackupService } from "@server/platform/operations/operations/contracts";
import type { IRestoreService } from "@server/platform/operations/operations/contracts";
import type { IRetentionService } from "@server/platform/operations/operations/contracts";
import { createMaintenanceResult, type MaintenanceResult } from "@server/platform/operations/operations/models";
import {
  createMaintenanceCompletedEvent,
  createMaintenanceStartedEvent,
} from "@server/platform/operations/operations/events";

/** Orchestrates platform maintenance operations. */
export class MaintenanceEngine implements IMaintenanceEngine {
  constructor(
    private readonly cleanupService: ICleanupService,
    private readonly backupService: IBackupService,
    private readonly restoreService: IRestoreService,
    private readonly retentionService: IRetentionService,
  ) {}

  async runMaintenance(): Promise<MaintenanceResult> {
    const operationId = `maintenance-${Date.now()}`;
    const startedAt = new Date().toISOString();
    createMaintenanceStartedEvent({ operationId, operation: "maintenance" });

    const cleanup = await this.cleanupService.cleanup();
    const backup = await this.backupService.backup();
    const retention = this.retentionService.applyRetention();

    const result = createMaintenanceResult({
      operationId,
      operation: "maintenance",
      status: "completed",
      startedAt,
      summary: "Full maintenance cycle completed.",
      details: Object.freeze({
        cleanup,
        backupId: backup.id,
        retention,
      }),
    });

    createMaintenanceCompletedEvent(result);
    return result;
  }

  runCleanup(): Promise<MaintenanceResult> {
    const operationId = `cleanup-${Date.now()}`;
    createMaintenanceStartedEvent({ operationId, operation: "cleanup" });
    return this.cleanupService.cleanup();
  }

  async runBackup(): Promise<MaintenanceResult> {
    const operationId = `backup-${Date.now()}`;
    const startedAt = new Date().toISOString();
    createMaintenanceStartedEvent({ operationId, operation: "backup" });

    const backup = await this.backupService.backup();
    const result = createMaintenanceResult({
      operationId,
      operation: "backup",
      status: "completed",
      startedAt,
      summary: `Backup created: ${backup.id}`,
      details: Object.freeze({ backupId: backup.id, kinds: backup.kinds }),
    });
    createMaintenanceCompletedEvent(result);
    return result;
  }

  runRestore(backupId: string): MaintenanceResult {
    const operationId = `restore-${Date.now()}`;
    const startedAt = new Date().toISOString();
    createMaintenanceStartedEvent({ operationId, operation: "restore" });

    const restore = this.restoreService.restore(backupId);
    const status = restore.restored.length > 0 ? "completed" : "failed";
    const result = createMaintenanceResult({
      operationId,
      operation: "restore",
      status,
      startedAt,
      summary:
        status === "completed"
          ? `Restored ${restore.restored.length} snapshot kinds from ${backupId}.`
          : `Restore failed for backup ${backupId}.`,
      details: Object.freeze({ restore }),
    });
    createMaintenanceCompletedEvent(result);
    return result;
  }

  runRetention(): MaintenanceResult {
    const operationId = `retention-${Date.now()}`;
    createMaintenanceStartedEvent({ operationId, operation: "retention" });
    return this.retentionService.applyRetention();
  }
}
