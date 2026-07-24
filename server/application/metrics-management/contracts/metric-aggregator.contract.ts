import type { MetricAggregationType } from "@server/application/metrics-management/models/metric.model";

export interface IMetricAggregator {
  aggregate(values: readonly number[], aggregation: MetricAggregationType): number;
}
