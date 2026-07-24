import type { MaintenanceMode } from "@server/application/modules/administration/administration/models";

export interface MaintenanceModeChangedEvent {
  readonly type: "administration.maintenance_mode.changed";
  readonly mode: MaintenanceMode;
  readonly occurredAt: string;
}

export function createMaintenanceModeChangedEvent(
  mode: MaintenanceMode,
): MaintenanceModeChangedEvent {
  return Object.freeze({
    type: "administration.maintenance_mode.changed",
    mode,
    occurredAt: new Date().toISOString(),
  });
}
