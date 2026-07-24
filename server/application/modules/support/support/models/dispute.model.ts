/** Order or delivery dispute linked to a support ticket. */
export interface Dispute {
  readonly id: string;
  readonly ticketId: string;
  readonly initiatorId: string;
  readonly counterpartyId: string;
  readonly orderId: string | null;
  readonly reason: string;
  readonly description: string;
  readonly createdAt: string;
}

export function createDispute(input: {
  id: string;
  ticketId: string;
  initiatorId: string;
  counterpartyId: string;
  orderId?: string | null;
  reason: string;
  description: string;
}): Dispute {
  return Object.freeze({
    id: input.id.trim(),
    ticketId: input.ticketId.trim(),
    initiatorId: input.initiatorId.trim(),
    counterpartyId: input.counterpartyId.trim(),
    orderId: input.orderId?.trim() || null,
    reason: input.reason.trim(),
    description: input.description.trim(),
    createdAt: new Date().toISOString(),
  });
}
