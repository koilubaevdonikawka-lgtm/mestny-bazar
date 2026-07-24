import type { IMetricRetentionPolicy } from "@server/application/metrics-management/contracts/metric-retention-policy.contract";
import type { MetricValue } from "@server/application/metrics-management/models/metric.model";

const DEFAULT_MAX_VALUES_PER_METRIC = 10_000;

/** Default retention policy — accepts all values, limits per-metric storage. */
export class DefaultMetricRetentionPolicy implements IMetricRetentionPolicy {
  constructor(private readonly maxValuesPerMetric: number = DEFAULT_MAX_VALUES_PER_METRIC) {}

  shouldRetainValue(_value: MetricValue): boolean {
    return true;
  }

  getMaxValuesPerMetric(): number {
    return this.maxValuesPerMetric;
  }
}
