import type { IMaintenanceEngine } from "@server/platform/operations/operations/contracts";
import type { IBackupService } from "@server/platform/operations/operations/contracts";
import type { IRestoreService } from "@server/platform/operations/operations/contracts";
import type { IRetentionService } from "@server/platform/operations/operations/contracts";
import type { IMaintenanceScheduler } from "@server/platform/operations/operations/contracts";
import type {
  BackupDescriptor,
  MaintenanceJob,
  MaintenanceResult,
  RestoreDescriptor,
} from "@server/platform/operations/operations/models";

/** Public operations platform facade. */
export class OperationsPlatform {
  constructor(
    private readonly maintenanceEngine: IMaintenanceEngine,
    private readonly backupService: IBackupService,
    private readonly restoreService: IRestoreService,
    private readonly retentionService: IRetentionService,
    private readonly scheduler: IMaintenanceScheduler,
  ) {}

  runMaintenance(): Promise<MaintenanceResult> {
    return this.maintenanceEngine.runMaintenance();
  }

  cleanup(): Promise<MaintenanceResult> {
    return this.maintenanceEngine.runCleanup();
  }

  backup(): Promise<BackupDescriptor> {
    return this.backupService.backup();
  }

  restore(backupId: string): RestoreDescriptor {
    return this.restoreService.restore(backupId);
  }

  applyRetention(): MaintenanceResult {
    return this.maintenanceEngine.runRetention();
  }

  registerJob(job: MaintenanceJob): void {
    this.scheduler.registerJob(job);
  }

  listJobs(): readonly MaintenanceJob[] {
    return this.scheduler.listJobs();
  }

  listBackups(): readonly BackupDescriptor[] {
    return this.backupService.listBackups();
  }

  listRetentionPolicies() {
    return this.retentionService.listPolicies();
  }
}
