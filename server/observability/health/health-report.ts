import type { HealthStatus } from "@server/observability/health/health-status";
import type { HealthCheckResult } from "@server/observability/health/health-check";

export interface HealthComponentReport {
  readonly status: HealthStatus;
  readonly message?: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly durationMs?: number;
}

/** Aggregated health report for all registered checks. */
export interface HealthReport {
  readonly status: HealthStatus;
  readonly timestamp: string;
  readonly components: Readonly<Record<string, HealthComponentReport>>;
}

/** Creates an immutable health report. */
export function createHealthReport(input: HealthReport): HealthReport {
  return Object.freeze({
    status: input.status,
    timestamp: input.timestamp,
    components: Object.freeze({ ...input.components }),
  });
}

export function toComponentReport(result: HealthCheckResult): HealthComponentReport {
  return Object.freeze({
    status: result.status,
    message: result.message,
    details: result.details,
    durationMs: result.durationMs,
  });
}
