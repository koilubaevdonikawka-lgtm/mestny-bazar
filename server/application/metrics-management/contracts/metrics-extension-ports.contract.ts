/**
 * Future integration ports for Metrics Management.
 * Not implemented — reserved for external metrics systems.
 */

import type {
  MetricDefinition,
  MetricValue,
} from "@server/application/metrics-management/models/metric.model";

/** Prometheus Provider — Prometheus integration. */
export interface IPrometheusProvider {
  registerMetric(metric: MetricDefinition): Promise<void>;
  recordValue(value: MetricValue): Promise<void>;
  scrapeMetrics(): Promise<string>;
}

/** OpenTelemetry Metrics Provider — OpenTelemetry integration. */
export interface IOpenTelemetryMetricsProvider {
  registerMetric(metric: MetricDefinition): Promise<void>;
  recordValue(value: MetricValue): Promise<void>;
  exportMetrics(): Promise<string>;
}

/** InfluxDB Provider — InfluxDB integration. */
export interface IInfluxDBProvider {
  writePoint(value: MetricValue): Promise<void>;
  queryMetrics(query: string): Promise<readonly MetricValue[]>;
}

/** Cloud Metrics Provider — cloud platform metrics integration. */
export interface ICloudMetricsProvider {
  publishMetric(metric: MetricDefinition, value: MetricValue): Promise<void>;
  fetchMetrics(metricId: string): Promise<readonly MetricValue[]>;
}

/** Metric Streaming Provider — real-time metric streaming. */
export interface IMetricStreamingProvider {
  publishValue(value: MetricValue): Promise<void>;
  subscribe(callback: (value: MetricValue) => void): Promise<void>;
}
