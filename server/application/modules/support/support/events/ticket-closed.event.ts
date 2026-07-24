import type { SupportTicket } from "@server/application/modules/support/support/models";

export interface TicketClosedEvent {
  readonly type: "support.ticket.closed";
  readonly ticket: SupportTicket;
  readonly occurredAt: string;
}

export function createTicketClosedEvent(ticket: SupportTicket): TicketClosedEvent {
  return Object.freeze({
    type: "support.ticket.closed",
    ticket,
    occurredAt: new Date().toISOString(),
  });
}
