import type { SupportTicket } from "@server/application/modules/support/support/models";

export interface TicketCreatedEvent {
  readonly type: "support.ticket.created";
  readonly ticket: SupportTicket;
  readonly occurredAt: string;
}

export function createTicketCreatedEvent(ticket: SupportTicket): TicketCreatedEvent {
  return Object.freeze({
    type: "support.ticket.created",
    ticket,
    occurredAt: new Date().toISOString(),
  });
}
