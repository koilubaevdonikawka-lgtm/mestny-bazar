import { createMetric, type Metric, type MetricLabels, type MetricSnapshot } from "@server/observability/metrics/metric";

/** Distribution metric with observed values and optional bucket boundaries. */
export class Histogram implements Metric {
  readonly name: string;
  readonly type = "histogram" as const;
  readonly description?: string;
  readonly unit?: string;
  readonly labels?: MetricLabels;
  readonly buckets?: readonly number[];

  private constructor(descriptor: Metric, labels?: MetricLabels, buckets?: readonly number[]) {
    this.name = descriptor.name;
    this.description = descriptor.description;
    this.unit = descriptor.unit;
    this.labels = labels ? Object.freeze({ ...labels }) : undefined;
    this.buckets = buckets ? Object.freeze([...buckets]) : undefined;
    Object.freeze(this);
  }

  static create(
    name: string,
    labels?: MetricLabels,
    options?: { description?: string; buckets?: readonly number[] },
  ): Histogram {
    return new Histogram(
      createMetric({ name, type: "histogram", description: options?.description }),
      labels,
      options?.buckets,
    );
  }

  snapshot(value: number, timestamp: string = new Date().toISOString()): MetricSnapshot {
    return Object.freeze({
      name: this.name,
      type: this.type,
      value,
      labels: this.labels,
      timestamp,
      unit: this.unit,
    });
  }
}
