import type { EvolutionResult } from "@server/platform/evolution/evolution/models";

/** Emitted when evolution execution completes. */
export interface EvolutionCompletedEvent {
  readonly type: "evolution.completed";
  readonly result: EvolutionResult;
}

export function createEvolutionCompletedEvent(result: EvolutionResult): EvolutionCompletedEvent {
  return Object.freeze({ type: "evolution.completed", result });
}
