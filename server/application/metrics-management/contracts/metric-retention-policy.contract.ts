import type { MetricValue } from "@server/application/metrics-management/models/metric.model";

export interface IMetricRetentionPolicy {
  shouldRetainValue(value: MetricValue): boolean;
  getMaxValuesPerMetric(): number;
}
