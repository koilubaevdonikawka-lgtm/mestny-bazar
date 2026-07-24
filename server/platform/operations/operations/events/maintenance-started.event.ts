/** Emitted when a maintenance operation starts. */
export interface MaintenanceStartedEvent {
  readonly type: "operations.maintenance.started";
  readonly operationId: string;
  readonly operation: string;
  readonly startedAt: string;
}

export function createMaintenanceStartedEvent(input: {
  operationId: string;
  operation: string;
}): MaintenanceStartedEvent {
  return Object.freeze({
    type: "operations.maintenance.started",
    operationId: input.operationId,
    operation: input.operation.trim(),
    startedAt: new Date().toISOString(),
  });
}
