/** DI tokens for the operations platform. */
export const OperationsTokens = {
  OperationsPlatform: Symbol.for("operations.platform"),
  MaintenanceEngine: Symbol.for("operations.maintenanceEngine"),
  CleanupService: Symbol.for("operations.cleanupService"),
  BackupService: Symbol.for("operations.backupService"),
  RestoreService: Symbol.for("operations.restoreService"),
  RetentionService: Symbol.for("operations.retentionService"),
  MaintenanceScheduler: Symbol.for("operations.maintenanceScheduler"),
} as const;

export type OperationsToken = (typeof OperationsTokens)[keyof typeof OperationsTokens];
