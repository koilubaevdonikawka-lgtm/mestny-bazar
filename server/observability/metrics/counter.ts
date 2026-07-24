import { createMetric, type Metric, type MetricLabels, type MetricSnapshot } from "@server/observability/metrics/metric";

/** Monotonically increasing counter metric. */
export class Counter implements Metric {
  readonly name: string;
  readonly type = "counter" as const;
  readonly description?: string;
  readonly unit?: string;
  readonly labels?: MetricLabels;

  private constructor(descriptor: Metric, labels?: MetricLabels) {
    this.name = descriptor.name;
    this.description = descriptor.description;
    this.unit = descriptor.unit;
    this.labels = labels ? Object.freeze({ ...labels }) : undefined;
    Object.freeze(this);
  }

  static create(name: string, labels?: MetricLabels, description?: string): Counter {
    return new Counter(createMetric({ name, type: "counter", description }), labels);
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
