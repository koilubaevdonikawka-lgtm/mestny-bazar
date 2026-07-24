export type MaintenanceStatus = "completed" | "partial" | "failed";

/** Result of a maintenance operation run. */
export interface MaintenanceResult {
  readonly operationId: string;
  readonly operation: string;
  readonly status: MaintenanceStatus;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly summary: string;
  readonly details: Readonly<Record<string, unknown>>;
}

export function createMaintenanceResult(input: {
  operationId?: string;
  operation: string;
  status: MaintenanceStatus;
  startedAt: string;
  summary: string;
  details?: Readonly<Record<string, unknown>>;
}): MaintenanceResult {
  return Object.freeze({
    operationId: input.operationId ?? `maintenance-${Date.now()}`,
    operation: input.operation.trim(),
    status: input.status,
    startedAt: input.startedAt,
    completedAt: new Date().toISOString(),
    summary: input.summary.trim(),
    details: Object.freeze({ ...(input.details ?? {}) }),
  });
}
