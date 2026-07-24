import {
  SupportPriority,
  type SupportPriorityValue,
} from "@server/application/modules/support/support/models/support-priority.model";
import {
  SupportStatus,
  type SupportStatusValue,
} from "@server/application/modules/support/support/models/support-status.model";
import {
  SupportTicketKind,
  type SupportTicketKindValue,
} from "@server/application/modules/support/support/models/support-ticket-kind.model";
import type { SupportMessage } from "@server/application/modules/support/support/models/support-message.model";

/** Support ticket owned by the Support capability module. */
export interface SupportTicket {
  readonly id: string;
  readonly subject: string;
  readonly kind: SupportTicketKindValue;
  readonly status: SupportStatusValue;
  readonly priority: SupportPriorityValue;
  readonly requesterId: string;
  readonly relatedEntityType: string | null;
  readonly relatedEntityId: string | null;
  readonly messages: readonly SupportMessage[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly closedAt: string | null;
}

export function createSupportTicket(input: {
  id: string;
  subject: string;
  kind: SupportTicketKindValue;
  priority: SupportPriorityValue;
  requesterId: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  initialMessage?: SupportMessage;
}): SupportTicket {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    subject: input.subject.trim(),
    kind: input.kind,
    status: SupportStatus.Open,
    priority: input.priority,
    requesterId: input.requesterId.trim(),
    relatedEntityType: input.relatedEntityType?.trim() || null,
    relatedEntityId: input.relatedEntityId?.trim() || null,
    messages: Object.freeze(input.initialMessage ? [input.initialMessage] : []),
    createdAt: timestamp,
    updatedAt: timestamp,
    closedAt: null,
  });
}

export function withSupportTicketMessage(
  ticket: SupportTicket,
  message: SupportMessage,
): SupportTicket {
  return Object.freeze({
    ...ticket,
    messages: Object.freeze([...ticket.messages, message]),
    updatedAt: new Date().toISOString(),
  });
}

export function withSupportTicketStatus(
  ticket: SupportTicket,
  status: SupportStatusValue,
): SupportTicket {
  const timestamp = new Date().toISOString();
  return Object.freeze({
    ...ticket,
    status,
    updatedAt: timestamp,
    closedAt:
      status === SupportStatus.Closed || status === SupportStatus.Resolved
        ? timestamp
        : ticket.closedAt,
  });
}

export function canReplyToSupportTicket(ticket: SupportTicket): boolean {
  return ticket.status === SupportStatus.Open || ticket.status === SupportStatus.InProgress;
}

export function canCloseSupportTicket(ticket: SupportTicket): boolean {
  return !isClosedSupportTicketStatus(ticket.status);
}

function isClosedSupportTicketStatus(status: SupportStatusValue): boolean {
  return status === SupportStatus.Closed || status === SupportStatus.Resolved;
}
