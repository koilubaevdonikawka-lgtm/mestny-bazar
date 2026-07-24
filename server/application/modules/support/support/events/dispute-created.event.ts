import type { Dispute } from "@server/application/modules/support/support/models";

export interface DisputeCreatedEvent {
  readonly type: "support.dispute.created";
  readonly dispute: Dispute;
  readonly occurredAt: string;
}

export function createDisputeCreatedEvent(dispute: Dispute): DisputeCreatedEvent {
  return Object.freeze({
    type: "support.dispute.created",
    dispute,
    occurredAt: new Date().toISOString(),
  });
}
