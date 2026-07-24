import type { IHealthStatusAggregator } from "@server/application/health-monitoring-management/contracts/health-status-aggregator.contract";
import {
  type ComponentHealthResult,
  type HealthCheckResult,
  type HealthStatus,
  type SystemHealthResult,
} from "@server/application/health-monitoring-management/models/health-monitoring.model";

/** Default health status aggregator. */
export class DefaultHealthStatusAggregator implements IHealthStatusAggregator {
  aggregateComponent(componentId: string, results: readonly HealthCheckResult[]): ComponentHealthResult {
    return Object.freeze({
      componentId,
      status: this.resolveStatus(results),
      checks: Object.freeze([...results]),
      checkedAt: new Date().toISOString(),
    });
  }

  aggregateSystem(results: readonly HealthCheckResult[]): SystemHealthResult {
    const componentMap = new Map<string, HealthCheckResult[]>();

    for (const result of results) {
      const existing = componentMap.get(result.componentId) ?? [];
      existing.push(result);
      componentMap.set(result.componentId, existing);
    }

    const components = Object.freeze(
      [...componentMap.entries()].map(([componentId, checks]) =>
        this.aggregateComponent(componentId, checks),
      ),
    );

    const healthyCount = results.filter((result) => result.status === "healthy").length;
    const degradedCount = results.filter((result) => result.status === "degraded").length;
    const unhealthyCount = results.filter((result) => result.status === "unhealthy").length;

    return Object.freeze({
      status: this.resolveStatus(results),
      healthyCount,
      degradedCount,
      unhealthyCount,
      totalChecks: results.length,
      components,
      checkedAt: new Date().toISOString(),
    });
  }

  resolveStatus(results: readonly HealthCheckResult[]): HealthStatus {
    if (results.some((result) => result.status === "unhealthy")) {
      return "unhealthy";
    }

    if (results.some((result) => result.status === "degraded")) {
      return "degraded";
    }

    if (results.length === 0) {
      return "healthy";
    }

    return "healthy";
  }
}
