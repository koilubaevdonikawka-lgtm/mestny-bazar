import type {
  MetricStatistics,
  MetricValue,
} from "@server/application/metrics-management/models/metric.model";

export interface IMetricCalculator {
  calculateStatistics(metricId: string, values: readonly MetricValue[]): MetricStatistics;
}
