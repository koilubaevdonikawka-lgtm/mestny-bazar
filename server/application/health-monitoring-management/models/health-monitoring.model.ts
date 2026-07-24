/** Registered health check definition — component monitoring only. */
export interface HealthCheckDefinition {
  readonly checkId: string;
  readonly componentId: string;
  readonly name: string;
  readonly checkType: string;
  readonly createdAt: string;
}

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface HealthCheckResult {
  readonly checkId: string;
  readonly componentId: string;
  readonly name: string;
  readonly status: HealthStatus;
  readonly message: string;
  readonly checkedAt: string;
  readonly durationMs: number;
}

export interface HealthHistoryEntry {
  readonly historyId: string;
  readonly checkId: string;
  readonly componentId: string;
  readonly status: HealthStatus;
  readonly message: string;
  readonly checkedAt: string;
  readonly durationMs: number;
}

export interface RegisterHealthCheckInput {
  readonly componentId: string;
  readonly name: string;
  readonly checkType: string;
}

export interface ComponentHealthResult {
  readonly componentId: string;
  readonly status: HealthStatus;
  readonly checks: readonly HealthCheckResult[];
  readonly checkedAt: string;
}

export interface SystemHealthResult {
  readonly status: HealthStatus;
  readonly healthyCount: number;
  readonly degradedCount: number;
  readonly unhealthyCount: number;
  readonly totalChecks: number;
  readonly components: readonly ComponentHealthResult[];
  readonly checkedAt: string;
}

export interface HealthHistoryResult {
  readonly entries: readonly HealthHistoryEntry[];
  readonly total: number;
}

export interface ListHealthChecksResult {
  readonly checks: readonly HealthCheckDefinition[];
  readonly total: number;
}

export function createHealthCheckDefinition(input: {
  checkId: string;
  componentId: string;
  name: string;
  checkType: string;
  createdAt?: string;
}): HealthCheckDefinition {
  return Object.freeze({
    checkId: input.checkId.trim(),
    componentId: input.componentId.trim(),
    name: input.name.trim(),
    checkType: input.checkType.trim(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}

export function createHealthCheckResult(input: {
  checkId: string;
  componentId: string;
  name: string;
  status: HealthStatus;
  message: string;
  checkedAt?: string;
  durationMs: number;
}): HealthCheckResult {
  return Object.freeze({
    checkId: input.checkId,
    componentId: input.componentId,
    name: input.name,
    status: input.status,
    message: input.message,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    durationMs: input.durationMs,
  });
}

export function createHealthHistoryEntry(input: {
  historyId: string;
  checkId: string;
  componentId: string;
  status: HealthStatus;
  message: string;
  checkedAt?: string;
  durationMs: number;
}): HealthHistoryEntry {
  return Object.freeze({
    historyId: input.historyId.trim(),
    checkId: input.checkId,
    componentId: input.componentId,
    status: input.status,
    message: input.message,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    durationMs: input.durationMs,
  });
}
