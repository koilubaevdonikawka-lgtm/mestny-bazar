import type { MaintenanceResult } from "@server/platform/operations/operations/models";

/** Contract for the maintenance orchestration engine. */
export interface IMaintenanceEngine {
  runMaintenance(): Promise<MaintenanceResult> | MaintenanceResult;
  runCleanup(): Promise<MaintenanceResult> | MaintenanceResult;
  runBackup(): Promise<MaintenanceResult> | MaintenanceResult;
  runRestore(backupId: string): Promise<MaintenanceResult> | MaintenanceResult;
  runRetention(): Promise<MaintenanceResult> | MaintenanceResult;
}
