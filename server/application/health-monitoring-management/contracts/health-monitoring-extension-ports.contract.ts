/**
 * Future integration ports for Health Monitoring Management.
 * Not implemented — reserved for external monitoring systems.
 */

import type {
  HealthCheckResult,
  HealthStatus,
} from "@server/application/health-monitoring-management/models/health-monitoring.model";

/** Kubernetes Health Provider — K8s probe integration. */
export interface IKubernetesHealthProvider {
  readLivenessProbe(namespace: string, podName: string): Promise<HealthStatus>;
  readReadinessProbe(namespace: string, podName: string): Promise<HealthStatus>;
}

/** Docker Health Provider — Docker container health integration. */
export interface IDockerHealthProvider {
  inspectContainerHealth(containerId: string): Promise<HealthStatus>;
  listUnhealthyContainers(): Promise<readonly string[]>;
}

/** Cloud Health Provider — cloud platform health integration. */
export interface ICloudHealthProvider {
  fetchServiceHealth(serviceName: string, region: string): Promise<HealthStatus>;
  listIncidents(): Promise<readonly string[]>;
}

/** Metrics Provider — metrics collection integration. */
export interface IMetricsProvider {
  recordHealthMetric(checkId: string, status: HealthStatus, durationMs: number): Promise<void>;
  queryMetric(metricName: string): Promise<number | null>;
}

/** Alert Provider — alerting integration. */
export interface IAlertProvider {
  sendAlert(checkId: string, status: HealthStatus, message: string): Promise<void>;
  resolveAlert(checkId: string): Promise<void>;
}

export type { HealthCheckResult };
