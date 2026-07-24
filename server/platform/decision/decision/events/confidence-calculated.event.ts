import type { DecisionConfidence } from "@server/platform/decision/decision/models";

export interface ConfidenceCalculatedEvent {
  readonly type: "decision.confidence.calculated";
  readonly confidence: DecisionConfidence;
}

export function createConfidenceCalculatedEvent(
  confidence: DecisionConfidence,
): ConfidenceCalculatedEvent {
  return Object.freeze({ type: "decision.confidence.calculated", confidence });
}
