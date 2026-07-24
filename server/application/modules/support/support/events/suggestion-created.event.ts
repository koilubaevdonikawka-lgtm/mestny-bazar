import type { Suggestion } from "@server/application/modules/support/support/models";

export interface SuggestionCreatedEvent {
  readonly type: "support.suggestion.created";
  readonly suggestion: Suggestion;
  readonly occurredAt: string;
}

export function createSuggestionCreatedEvent(suggestion: Suggestion): SuggestionCreatedEvent {
  return Object.freeze({
    type: "support.suggestion.created",
    suggestion,
    occurredAt: new Date().toISOString(),
  });
}
