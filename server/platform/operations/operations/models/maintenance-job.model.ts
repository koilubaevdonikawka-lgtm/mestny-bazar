export type MaintenanceOperationKind =
  | "maintenance"
  | "cleanup"
  | "backup"
  | "restore"
  | "retention";

/** Registered maintenance job schedule descriptor. */
export interface MaintenanceJob {
  readonly id: string;
  readonly name: string;
  readonly operation: MaintenanceOperationKind;
  readonly schedule: string;
  readonly enabled: boolean;
  readonly registeredAt: string;
}

export function createMaintenanceJob(input: {
  id: string;
  name: string;
  operation: MaintenanceOperationKind;
  schedule: string;
  enabled?: boolean;
}): MaintenanceJob {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    operation: input.operation,
    schedule: input.schedule.trim(),
    enabled: input.enabled ?? true,
    registeredAt: new Date().toISOString(),
  });
}
