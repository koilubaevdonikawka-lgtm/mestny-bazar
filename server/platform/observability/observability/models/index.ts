import type { MetricDescriptor } from "./metric-descriptor.model";

export {
  type MetricSource,
  type MetricDescriptor,
  createMetricDescriptor,
} from "./metric-descriptor.model";
export {
  type TraceDescriptor,
  createTraceDescriptor,
} from "./trace-descriptor.model";
export {
  type SpanDescriptor,
  createSpanDescriptor,
} from "./span-descriptor.model";
export {
  type LogSeverity,
  type LogEntry,
  createLogEntry,
} from "./log-entry.model";
export {
  type CorrelationContext,
  createCorrelationContext,
} from "./correlation-context.model";

export type SamplingPolicyKind = "always" | "never" | "percentage" | "adaptive";

export interface TelemetryEvent {
  readonly id: string;
  readonly name: string;
  readonly source: string;
  readonly recordedAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export function createTelemetryEvent(input: {
  id?: string;
  name: string;
  source: string;
  payload?: Readonly<Record<string, unknown>>;
}): TelemetryEvent {
  return Object.freeze({
    id: input.id ?? `event-${Date.now()}`,
    name: input.name.trim(),
    source: input.source.trim(),
    recordedAt: new Date().toISOString(),
    payload: Object.freeze({ ...(input.payload ?? {}) }),
  });
}

export interface MetricsQueryResult {
  readonly total: number;
  readonly metrics: readonly MetricDescriptor[];
}

export function createMetricsQueryResult(input: {
  metrics: readonly MetricDescriptor[];
}): MetricsQueryResult {
  return Object.freeze({
    total: input.metrics.length,
    metrics: Object.freeze([...input.metrics]),
  });
}
