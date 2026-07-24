import type {
  CorrelationContext,
  MetricDescriptor,
  MetricsQueryResult,
  TelemetryEvent,
  TraceDescriptor,
} from "@server/platform/observability/observability/models";

/** Contract for observability lifecycle orchestration. */
export interface IObservabilityManager {
  recordMetric(metric: MetricDescriptor): MetricDescriptor;
  recordEvent(event: TelemetryEvent): TelemetryEvent;
  startTrace(name: string): TraceDescriptor;
  finishTrace(traceId: string): TraceDescriptor;
  createCorrelation(input?: Partial<CorrelationContext>): CorrelationContext;
  queryMetrics(source?: MetricDescriptor["source"]): MetricsQueryResult;
}
