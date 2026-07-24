import type {
  ComponentHealthResult,
  HealthCheckResult,
  HealthStatus,
  SystemHealthResult,
} from "@server/application/health-monitoring-management/models/health-monitoring.model";

export interface IHealthStatusAggregator {
  aggregateComponent(componentId: string, results: readonly HealthCheckResult[]): ComponentHealthResult;
  aggregateSystem(results: readonly HealthCheckResult[]): SystemHealthResult;
  resolveStatus(results: readonly HealthCheckResult[]): HealthStatus;
}
