import type { IObservabilityManager } from "@server/platform/observability/observability/contracts";
import type { IMetricsCollector } from "@server/platform/observability/observability/contracts";
import type { ITracingEngine } from "@server/platform/observability/observability/contracts";
import type { ICorrelationManager } from "@server/platform/observability/observability/contracts";
import type { ILoggingRegistry } from "@server/platform/observability/observability/contracts";
import {
  createLogEntry,
  createMetricsQueryResult,
  createTelemetryEvent,
  type CorrelationContext,
  type MetricDescriptor,
  type MetricsQueryResult,
  type TelemetryEvent,
  type TraceDescriptor,
} from "@server/platform/observability/observability/models";

/** Orchestrates observability recording, tracing and correlation. */
export class ObservabilityManager implements IObservabilityManager {
  private readonly events: TelemetryEvent[] = [];

  constructor(
    private readonly metricsCollector: IMetricsCollector,
    private readonly tracingEngine: ITracingEngine,
    private readonly correlationManager: ICorrelationManager,
    private readonly loggingRegistry: ILoggingRegistry,
  ) {}

  recordMetric(metric: MetricDescriptor): MetricDescriptor {
    return this.metricsCollector.record(metric);
  }

  recordEvent(event: TelemetryEvent): TelemetryEvent {
    const stored = createTelemetryEvent(event);
    this.events.push(stored);
    this.loggingRegistry.registerEntry(
      createLogEntry({
        id: stored.id,
        category: "telemetry-event",
        severity: "info",
        message: stored.name,
        fields: stored.payload,
      }),
    );
    return stored;
  }

  startTrace(name: string): TraceDescriptor {
    return this.tracingEngine.startTrace(name);
  }

  finishTrace(traceId: string): TraceDescriptor {
    return this.tracingEngine.finishTrace(traceId);
  }

  createCorrelation(input: Partial<CorrelationContext> = {}): CorrelationContext {
    return this.correlationManager.create(input);
  }

  queryMetrics(source?: MetricDescriptor["source"]): MetricsQueryResult {
    return createMetricsQueryResult({
      metrics: this.metricsCollector.query(source),
    });
  }
}
