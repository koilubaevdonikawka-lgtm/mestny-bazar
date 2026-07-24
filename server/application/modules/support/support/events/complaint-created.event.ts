import type { Complaint } from "@server/application/modules/support/support/models";

export interface ComplaintCreatedEvent {
  readonly type: "support.complaint.created";
  readonly complaint: Complaint;
  readonly occurredAt: string;
}

export function createComplaintCreatedEvent(complaint: Complaint): ComplaintCreatedEvent {
  return Object.freeze({
    type: "support.complaint.created",
    complaint,
    occurredAt: new Date().toISOString(),
  });
}
