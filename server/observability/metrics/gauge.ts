import { createMetric, type Metric, type MetricLabels, type MetricSnapshot } from "@server/observability/metrics/metric";

/** Point-in-time gauge metric. */
export class Gauge implements Metric {
  readonly name: string;
  readonly type = "gauge" as const;
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

  static create(name: string, labels?: MetricLabels, description?: string): Gauge {
    return new Gauge(createMetric({ name, type: "gauge", description }), labels);
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
