import { ObservabilityEvent } from "@server/observability/shared";
import type { LogEntry } from "@server/observability/logging";

/** Emitted when a structured log entry is created. */
export class LogCreatedEvent extends ObservabilityEvent {
  readonly eventName = "observability.log.created" as const;
  readonly payload: Readonly<{ entry: LogEntry }>;

  constructor(entry: LogEntry, occurredAt?: string) {
    super(occurredAt);
    this.payload = Object.freeze({ entry });
    Object.freeze(this);
  }
}
