import type { GenerationResult } from "@server/platform/developer/developer/models";

/** Emitted when code generation completes. */
export interface GenerationCompletedEvent {
  readonly type: "developer.generation.completed";
  readonly result: GenerationResult;
}

export function createGenerationCompletedEvent(result: GenerationResult): GenerationCompletedEvent {
  return Object.freeze({ type: "developer.generation.completed", result });
}
