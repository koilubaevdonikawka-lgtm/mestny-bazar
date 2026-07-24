import type { HealthStatus } from "@server/observability/health/health-status";

export interface HealthCheckResult {
  readonly status: HealthStatus;
  readonly message?: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly durationMs?: number;
}

/** Contract for a single health probe. */
export interface HealthCheck {
  readonly name: string;
  check(): Promise<HealthCheckResult> | HealthCheckResult;
}

/** Creates a frozen health check result. */
export function createHealthCheckResult(input: HealthCheckResult): HealthCheckResult {
  return Object.freeze({
    status: input.status,
    message: input.message?.trim() || undefined,
    details: input.details ? Object.freeze({ ...input.details }) : undefined,
    durationMs: input.durationMs,
  });
}

/** Wraps a synchronous or async probe function as a HealthCheck. */
export function defineHealthCheck(
  name: string,
  probe: () => Promise<HealthCheckResult> | HealthCheckResult,
): HealthCheck {
  return Object.freeze({
    name,
    check: probe,
  });
}
