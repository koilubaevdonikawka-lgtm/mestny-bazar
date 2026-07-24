export {
  type MaintenanceStartedEvent,
  createMaintenanceStartedEvent,
} from "./maintenance-started.event";
export {
  type MaintenanceCompletedEvent,
  createMaintenanceCompletedEvent,
} from "./maintenance-completed.event";
export {
  type BackupCompletedEvent,
  createBackupCompletedEvent,
} from "./backup-completed.event";
export {
  type RestoreCompletedEvent,
  createRestoreCompletedEvent,
} from "./restore-completed.event";
export {
  type RetentionCompletedEvent,
  createRetentionCompletedEvent,
} from "./retention-completed.event";

export type OperationsPlatformEvent =
  | MaintenanceStartedEvent
  | MaintenanceCompletedEvent
  | BackupCompletedEvent
  | RestoreCompletedEvent
  | RetentionCompletedEvent;
