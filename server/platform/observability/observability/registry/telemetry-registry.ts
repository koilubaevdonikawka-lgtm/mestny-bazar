import type { ITelemetryRegistry } from "@server/platform/observability/observability/contracts";
import type {
  TelemetryCorrelationTypeRegistration,
  TelemetryLogCategoryRegistration,
  TelemetryMetricRegistration,
  TelemetrySourceRegistration,
  TelemetryTraceTypeRegistration,
} from "@server/platform/observability/observability/contracts";

/** Central registry for telemetry metadata definitions. */
export class TelemetryRegistry implements ITelemetryRegistry {
  private readonly metrics: TelemetryMetricRegistration[] = [];
  private readonly traceTypes: TelemetryTraceTypeRegistration[] = [];
  private readonly logCategories: TelemetryLogCategoryRegistration[] = [];
  private readonly correlationTypes: TelemetryCorrelationTypeRegistration[] = [];
  private readonly sources: TelemetrySourceRegistration[] = [];

  registerMetric(definition: TelemetryMetricRegistration): void {
    this.metrics.push(Object.freeze({ ...definition }));
  }

  registerTraceType(definition: TelemetryTraceTypeRegistration): void {
    this.traceTypes.push(Object.freeze({ ...definition }));
  }

  registerLogCategory(definition: TelemetryLogCategoryRegistration): void {
    this.logCategories.push(Object.freeze({ ...definition }));
  }

  registerCorrelationType(definition: TelemetryCorrelationTypeRegistration): void {
    this.correlationTypes.push(Object.freeze({ ...definition }));
  }

  registerSource(definition: TelemetrySourceRegistration): void {
    this.sources.push(Object.freeze({ ...definition }));
  }

  listMetrics(): readonly TelemetryMetricRegistration[] {
    return Object.freeze([...this.metrics]);
  }

  listTraceTypes(): readonly TelemetryTraceTypeRegistration[] {
    return Object.freeze([...this.traceTypes]);
  }

  listLogCategories(): readonly TelemetryLogCategoryRegistration[] {
    return Object.freeze([...this.logCategories]);
  }

  listCorrelationTypes(): readonly TelemetryCorrelationTypeRegistration[] {
    return Object.freeze([...this.correlationTypes]);
  }

  listSources(): readonly TelemetrySourceRegistration[] {
    return Object.freeze([...this.sources]);
  }
}
