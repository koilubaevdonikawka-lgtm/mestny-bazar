export type MetricSource =
  | "platform"
  | "provider"
  | "runtime"
  | "gateway"
  | "sdk"
  | "testing";

/** Recorded metric metadata descriptor. */
export interface MetricDescriptor {
  readonly id: string;
  readonly name: string;
  readonly source: MetricSource;
  readonly value: number;
  readonly unit: string;
  readonly recordedAt: string;
  readonly labels?: Readonly<Record<string, string>>;
}

export function createMetricDescriptor(input: {
  id?: string;
  name: string;
  source: MetricSource;
  value: number;
  unit?: string;
  labels?: Readonly<Record<string, string>>;
}): MetricDescriptor {
  return Object.freeze({
    id: input.id ?? `metric-${Date.now()}`,
    name: input.name.trim(),
    source: input.source,
    value: input.value,
    unit: input.unit?.trim() || "count",
    recordedAt: new Date().toISOString(),
    labels: input.labels ? Object.freeze({ ...input.labels }) : undefined,
  });
}
