import type {
  MetricDefinition,
  MetricValue,
} from "@server/application/metrics-management/models/metric.model";

export interface IMetricExporter {
  export(
    metrics: readonly MetricDefinition[],
    valuesByMetricId: Readonly<Record<string, readonly MetricValue[]>>,
  ): Promise<string>;
}
