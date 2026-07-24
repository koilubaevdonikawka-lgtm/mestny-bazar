import type { SupportTicket } from "@server/application/modules/support/support/models";
import type { SupportMessage } from "@server/application/modules/support/support/models/support-message.model";

export interface TicketRepliedEvent {
  readonly type: "support.ticket.replied";
  readonly ticket: SupportTicket;
  readonly message: SupportMessage;
  readonly occurredAt: string;
}

export function createTicketRepliedEvent(
  ticket: SupportTicket,
  message: SupportMessage,
): TicketRepliedEvent {
  return Object.freeze({
    type: "support.ticket.replied",
    ticket,
    message,
    occurredAt: new Date().toISOString(),
  });
}
