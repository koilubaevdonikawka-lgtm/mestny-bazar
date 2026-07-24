import type { MaintenanceResult } from "@server/platform/operations/operations/models";

/** Emitted when a maintenance operation completes. */
export interface MaintenanceCompletedEvent {
  readonly type: "operations.maintenance.completed";
  readonly result: MaintenanceResult;
}

export function createMaintenanceCompletedEvent(
  result: MaintenanceResult,
): MaintenanceCompletedEvent {
  return Object.freeze({ type: "operations.maintenance.completed", result });
}
