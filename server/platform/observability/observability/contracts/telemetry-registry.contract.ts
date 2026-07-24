import type { MetricDescriptor, TraceDescriptor } from "@server/platform/observability/observability/models";

export interface TelemetryMetricRegistration {
  readonly name: string;
  readonly source: MetricDescriptor["source"];
}

export interface TelemetryTraceTypeRegistration {
  readonly name: string;
  readonly description?: string;
}

export interface TelemetryLogCategoryRegistration {
  readonly category: string;
  readonly severity: string;
}

export interface TelemetryCorrelationTypeRegistration {
  readonly type: string;
}

export interface TelemetrySourceRegistration {
  readonly id: string;
  readonly platform: string;
}

/** Contract for telemetry metadata registration. */
export interface ITelemetryRegistry {
  registerMetric(definition: TelemetryMetricRegistration): void;
  registerTraceType(definition: TelemetryTraceTypeRegistration): void;
  registerLogCategory(definition: TelemetryLogCategoryRegistration): void;
  registerCorrelationType(definition: TelemetryCorrelationTypeRegistration): void;
  registerSource(definition: TelemetrySourceRegistration): void;
  listMetrics(): readonly TelemetryMetricRegistration[];
  listTraceTypes(): readonly TelemetryTraceTypeRegistration[];
  listLogCategories(): readonly TelemetryLogCategoryRegistration[];
  listCorrelationTypes(): readonly TelemetryCorrelationTypeRegistration[];
  listSources(): readonly TelemetrySourceRegistration[];
}

export type { TraceDescriptor };
