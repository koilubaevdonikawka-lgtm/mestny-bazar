import type { IMetricCalculator } from "@server/application/metrics-management/contracts/metric-calculator.contract";
import type {
  MetricStatistics,
  MetricValue,
} from "@server/application/metrics-management/models/metric.model";

/** Default metric statistics calculator. */
export class DefaultMetricCalculator implements IMetricCalculator {
  calculateStatistics(metricId: string, values: readonly MetricValue[]): MetricStatistics {
    if (values.length === 0) {
      return Object.freeze({
        metricId,
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
        latest: null,
        latestRecordedAt: null,
      });
    }

    const numericValues = values.map((entry) => entry.value);
    const sum = numericValues.reduce((total, value) => total + value, 0);
    const latestEntry = [...values].sort((left, right) =>
      right.recordedAt.localeCompare(left.recordedAt),
    )[0];

    return Object.freeze({
      metricId,
      count: values.length,
      sum,
      avg: sum / values.length,
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      latest: latestEntry?.value ?? null,
      latestRecordedAt: latestEntry?.recordedAt ?? null,
    });
  }
}
