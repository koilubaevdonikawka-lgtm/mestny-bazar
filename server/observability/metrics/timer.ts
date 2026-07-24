import { createMetric, type Metric, type MetricLabels, type MetricSnapshot } from "@server/observability/metrics/metric";

/** Duration metric for latency measurements. */
export class Timer implements Metric {
  readonly name: string;
  readonly type = "timer" as const;
  readonly description?: string;
  readonly unit: string;
  readonly labels?: MetricLabels;

  private constructor(descriptor: Metric, labels?: MetricLabels) {
    this.name = descriptor.name;
    this.description = descriptor.description;
    this.unit = descriptor.unit ?? "ms";
    this.labels = labels ? Object.freeze({ ...labels }) : undefined;
    Object.freeze(this);
  }

  static create(name: string, labels?: MetricLabels, description?: string): Timer {
    return new Timer(createMetric({ name, type: "timer", description, unit: "ms" }), labels);
  }

  snapshot(durationMs: number, timestamp: string = new Date().toISOString()): MetricSnapshot {
    return Object.freeze({
      name: this.name,
      type: this.type,
      value: durationMs,
      labels: this.labels,
      timestamp,
      unit: this.unit,
    });
  }

  /** Helper to measure an async operation and return its result. */
  static async measure<T>(
    timer: Timer,
    operation: () => Promise<T> | T,
  ): Promise<{ result: T; snapshot: MetricSnapshot; durationMs: number }> {
    const started = performance.now();
    const result = await operation();
    const durationMs = performance.now() - started;
    return {
      result,
      durationMs,
      snapshot: timer.snapshot(durationMs),
    };
  }
}
