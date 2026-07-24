import { ObservabilityEvent } from "@server/observability/shared";
import type { HealthReport, HealthStatus } from "@server/observability/health";

/** Emitted when aggregate health status changes. */
export class HealthChangedEvent extends ObservabilityEvent {
  readonly eventName = "observability.health.changed" as const;
  readonly payload: Readonly<{
    previousStatus: HealthStatus;
    currentStatus: HealthStatus;
    report: HealthReport;
  }>;

  constructor(
    previousStatus: HealthStatus,
    report: HealthReport,
    occurredAt?: string,
  ) {
    super(occurredAt);
    this.payload = Object.freeze({
      previousStatus,
      currentStatus: report.status,
      report,
    });
    Object.freeze(this);
  }
}
