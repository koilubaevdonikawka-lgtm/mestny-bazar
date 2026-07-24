import type { MetricDescriptor } from "@server/platform/observability/observability/models";

/** Contract for platform metrics collection. */
export interface IMetricsCollector {
  collect(): readonly MetricDescriptor[];
  record(metric: MetricDescriptor): MetricDescriptor;
  query(source?: MetricDescriptor["source"]): readonly MetricDescriptor[];
}
