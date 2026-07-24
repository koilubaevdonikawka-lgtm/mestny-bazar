import type { IMetricExporter } from "@server/application/metrics-management/contracts/metric-exporter.contract";
import type {
  MetricDefinition,
  MetricValue,
} from "@server/application/metrics-management/models/metric.model";

/** JSON metric exporter — serializes metrics and values. */
export class JsonMetricExporter implements IMetricExporter {
  async export(
    metrics: readonly MetricDefinition[],
    valuesByMetricId: Readonly<Record<string, readonly MetricValue[]>>,
  ): Promise<string> {
    const payload = metrics.map((metric) =>
      Object.freeze({
        ...metric,
        values: valuesByMetricId[metric.metricId] ?? [],
      }),
    );

    return JSON.stringify(payload, null, 2);
  }
}
