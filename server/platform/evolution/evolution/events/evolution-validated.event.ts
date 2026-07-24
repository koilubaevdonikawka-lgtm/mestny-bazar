import type { EvolutionValidationResult } from "@server/platform/evolution/evolution/models";

/** Emitted when evolution validation completes. */
export interface EvolutionValidatedEvent {
  readonly type: "evolution.validated";
  readonly result: EvolutionValidationResult;
}

export function createEvolutionValidatedEvent(
  result: EvolutionValidationResult,
): EvolutionValidatedEvent {
  return Object.freeze({ type: "evolution.validated", result });
}
