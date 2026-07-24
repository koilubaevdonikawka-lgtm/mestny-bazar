import type { IMetricAggregator } from "@server/application/metrics-management/contracts/metric-aggregator.contract";
import type { MetricAggregationType } from "@server/application/metrics-management/models/metric.model";

/** Default metric aggregator — sum, avg, min, max, count. */
export class DefaultMetricAggregator implements IMetricAggregator {
  aggregate(values: readonly number[], aggregation: MetricAggregationType): number {
    if (values.length === 0) {
      return aggregation === "count" ? 0 : 0;
    }

    switch (aggregation) {
      case "sum":
        return values.reduce((total, value) => total + value, 0);
      case "avg":
        return values.reduce((total, value) => total + value, 0) / values.length;
      case "min":
        return Math.min(...values);
      case "max":
        return Math.max(...values);
      case "count":
        return values.length;
      default:
        return 0;
    }
  }
}
