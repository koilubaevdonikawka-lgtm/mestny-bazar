import type { MetricDescriptor } from "@server/platform/observability/observability/models";

export interface MetricRecordedEvent {
  readonly type: "observability.metric.recorded";
  readonly metric: MetricDescriptor;
}

export function createMetricRecordedEvent(metric: MetricDescriptor): MetricRecordedEvent {
  return Object.freeze({ type: "observability.metric.recorded", metric });
}
