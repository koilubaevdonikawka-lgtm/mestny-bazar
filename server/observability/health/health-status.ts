/** Aggregate health status for observability reporting. */
export type HealthStatus = "healthy" | "degraded" | "unhealthy";

/** Priority ordering for health status aggregation. */
export const HealthStatusPriority: Readonly<Record<HealthStatus, number>> = Object.freeze({
  healthy: 1,
  degraded: 2,
  unhealthy: 3,
});

/** Returns the most severe status from a list. */
export function mergeHealthStatuses(statuses: readonly HealthStatus[]): HealthStatus {
  if (statuses.length === 0) {
    return "healthy";
  }

  return statuses.reduce((current, next) =>
    HealthStatusPriority[next] > HealthStatusPriority[current] ? next : current,
  );
}
