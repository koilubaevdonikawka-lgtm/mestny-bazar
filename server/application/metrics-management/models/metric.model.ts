export type MetricAggregationType = "sum" | "avg" | "min" | "max" | "count";

/** Metric definition — system metrics only, no domain data. */
export interface MetricDefinition {
  readonly metricId: string;
  readonly name: string;
  readonly unit: string;
  readonly description: string;
  readonly source: string;
  readonly createdAt: string;
}

/** Recorded metric value. */
export interface MetricValue {
  readonly valueId: string;
  readonly metricId: string;
  readonly value: number;
  readonly labels: Readonly<Record<string, string>>;
  readonly recordedAt: string;
}

export interface RegisterMetricInput {
  readonly name: string;
  readonly unit?: string;
  readonly description?: string;
  readonly source?: string;
}

export interface RecordMetricValueInput {
  readonly metricId: string;
  readonly value: number;
  readonly labels?: Readonly<Record<string, string>>;
  readonly recordedAt?: string;
}

export interface AggregateMetricsInput {
  readonly metricIds?: readonly string[];
  readonly aggregation: MetricAggregationType;
  readonly from?: string;
  readonly to?: string;
}

export interface AggregateMetricsResult {
  readonly aggregation: MetricAggregationType;
  readonly metricIds: readonly string[];
  readonly value: number;
  readonly valueCount: number;
}

export interface MetricStatistics {
  readonly metricId: string;
  readonly count: number;
  readonly sum: number;
  readonly avg: number;
  readonly min: number;
  readonly max: number;
  readonly latest: number | null;
  readonly latestRecordedAt: string | null;
}

export interface ListMetricsResult {
  readonly metrics: readonly MetricDefinition[];
  readonly total: number;
}

export interface ExportMetricsResult {
  readonly format: string;
  readonly payload: string;
  readonly count: number;
}

export function createMetricDefinition(input: {
  metricId: string;
  name: string;
  unit?: string;
  description?: string;
  source?: string;
  createdAt?: string;
}): MetricDefinition {
  return Object.freeze({
    metricId: input.metricId.trim(),
    name: input.name.trim(),
    unit: (input.unit ?? "count").trim(),
    description: (input.description ?? "").trim(),
    source: (input.source ?? "system").trim(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}

export function createMetricValue(input: {
  valueId: string;
  metricId: string;
  value: number;
  labels?: Readonly<Record<string, string>>;
  recordedAt?: string;
}): MetricValue {
  return Object.freeze({
    valueId: input.valueId.trim(),
    metricId: input.metricId.trim(),
    value: input.value,
    labels: Object.freeze({ ...(input.labels ?? {}) }),
    recordedAt: input.recordedAt ?? new Date().toISOString(),
  });
}

export function isMetricAggregationType(value: string): value is MetricAggregationType {
  return (
    value === "sum" ||
    value === "avg" ||
    value === "min" ||
    value === "max" ||
    value === "count"
  );
}
