import { ObservabilityEvent } from "@server/observability/shared";
import type { MetricSnapshot } from "@server/observability/metrics";

/** Emitted when a metric data point is recorded. */
export class MetricRecordedEvent extends ObservabilityEvent {
  readonly eventName = "observability.metric.recorded" as const;
  readonly payload: Readonly<{ snapshot: MetricSnapshot }>;

  constructor(snapshot: MetricSnapshot, occurredAt?: string) {
    super(occurredAt);
    this.payload = Object.freeze({ snapshot });
    Object.freeze(this);
  }
}
