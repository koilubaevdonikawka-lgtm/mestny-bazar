/** User suggestion linked to a support ticket. */
export interface Suggestion {
  readonly id: string;
  readonly ticketId: string;
  readonly authorId: string;
  readonly title: string;
  readonly description: string;
  readonly createdAt: string;
}

export function createSuggestion(input: {
  id: string;
  ticketId: string;
  authorId: string;
  title: string;
  description: string;
}): Suggestion {
  return Object.freeze({
    id: input.id.trim(),
    ticketId: input.ticketId.trim(),
    authorId: input.authorId.trim(),
    title: input.title.trim(),
    description: input.description.trim(),
    createdAt: new Date().toISOString(),
  });
}
