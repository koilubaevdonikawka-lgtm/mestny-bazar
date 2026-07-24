/** Message within a support ticket thread. */
export interface SupportMessage {
  readonly id: string;
  readonly ticketId: string;
  readonly authorId: string;
  readonly body: string;
  readonly createdAt: string;
}

export function createSupportMessage(input: {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
}): SupportMessage {
  return Object.freeze({
    id: input.id.trim(),
    ticketId: input.ticketId.trim(),
    authorId: input.authorId.trim(),
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
  });
}
