/** User complaint linked to a support ticket. */
export interface Complaint {
  readonly id: string;
  readonly ticketId: string;
  readonly complainantId: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly reason: string;
  readonly description: string;
  readonly createdAt: string;
}

export function createComplaint(input: {
  id: string;
  ticketId: string;
  complainantId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string;
}): Complaint {
  return Object.freeze({
    id: input.id.trim(),
    ticketId: input.ticketId.trim(),
    complainantId: input.complainantId.trim(),
    targetType: input.targetType.trim(),
    targetId: input.targetId.trim(),
    reason: input.reason.trim(),
    description: input.description.trim(),
    createdAt: new Date().toISOString(),
  });
}
