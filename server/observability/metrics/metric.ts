/** Metric kind supported by the observability layer. */
export type MetricType = "counter" | "gauge" | "histogram" | "timer";

/** Label set attached to metric data points. */
export type MetricLabels = Readonly<Record<string, string>>;

/** Snapshot of a recorded metric value. */
export interface MetricSnapshot {
  readonly name: string;
  readonly type: MetricType;
  readonly value: number;
  readonly labels?: MetricLabels;
  readonly timestamp: string;
  readonly unit?: string;
}

/** Base metric descriptor — provider-agnostic. */
export interface Metric {
  readonly name: string;
  readonly type: MetricType;
  readonly description?: string;
  readonly unit?: string;
}

/** Creates an immutable metric descriptor. */
export function createMetric(input: Metric): Metric {
  const name = input.name?.trim();
  if (!name) {
    throw new Error("Metric requires a non-empty name.");
  }

  return Object.freeze({
    name,
    type: input.type,
    description: input.description?.trim() || undefined,
    unit: input.unit?.trim() || undefined,
  });
}
