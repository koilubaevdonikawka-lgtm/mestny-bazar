import { ObservabilityEvent } from "@server/observability/shared";
import type { AuditRecord } from "@server/observability/audit";

/** Emitted when an audit record is persisted. */
export class AuditRecordedEvent extends ObservabilityEvent {
  readonly eventName = "observability.audit.recorded" as const;
  readonly payload: Readonly<{ record: AuditRecord }>;

  constructor(record: AuditRecord, occurredAt?: string) {
    super(occurredAt);
    this.payload = Object.freeze({ record });
    Object.freeze(this);
  }
}
