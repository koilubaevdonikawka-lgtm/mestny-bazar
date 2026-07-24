import type { IObservabilityManager } from "@server/platform/observability/observability/contracts";
import type {
  CorrelationContext,
  MetricDescriptor,
  MetricsQueryResult,
  TelemetryEvent,
  TraceDescriptor,
} from "@server/platform/observability/observability/models";

/** Public observability platform facade. */
export class ObservabilityPlatform {
  constructor(private readonly manager: IObservabilityManager) {}

  recordMetric(metric: MetricDescriptor): MetricDescriptor {
    return this.manager.recordMetric(metric);
  }

  recordEvent(event: TelemetryEvent): TelemetryEvent {
    return this.manager.recordEvent(event);
  }

  startTrace(name: string): TraceDescriptor {
    return this.manager.startTrace(name);
  }

  finishTrace(traceId: string): TraceDescriptor {
    return this.manager.finishTrace(traceId);
  }

  createCorrelation(input?: Partial<CorrelationContext>): CorrelationContext {
    return this.manager.createCorrelation(input);
  }

  queryMetrics(source?: MetricDescriptor["source"]): MetricsQueryResult {
    return this.manager.queryMetrics(source);
  }
}
