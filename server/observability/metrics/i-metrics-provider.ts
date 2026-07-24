import type { Counter } from "@server/observability/metrics/counter";
import type { Gauge } from "@server/observability/metrics/gauge";
import type { Histogram } from "@server/observability/metrics/histogram";
import type { MetricLabels, MetricSnapshot } from "@server/observability/metrics/metric";
import type { Timer } from "@server/observability/metrics/timer";

/** Handle for incrementing a counter metric. */
export interface CounterHandle {
  increment(value?: number): void;
  metric(): Counter;
}

/** Handle for setting a gauge metric. */
export interface GaugeHandle {
  set(value: number): void;
  metric(): Gauge;
}

/** Handle for observing histogram values. */
export interface HistogramHandle {
  observe(value: number): void;
  metric(): Histogram;
}

/** Handle for recording timer durations. */
export interface TimerHandle {
  record(durationMs: number): void;
  metric(): Timer;
}

/** Metrics recording port — implementations live in infrastructure. */
export interface IMetricsProvider {
  counter(name: string, labels?: MetricLabels): CounterHandle;
  gauge(name: string, labels?: MetricLabels): GaugeHandle;
  histogram(name: string, labels?: MetricLabels): HistogramHandle;
  timer(name: string, labels?: MetricLabels): TimerHandle;
  record(snapshot: MetricSnapshot): void;
}
