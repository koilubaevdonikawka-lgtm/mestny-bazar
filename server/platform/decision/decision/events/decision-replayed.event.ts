import type { DecisionResult } from "@server/platform/decision/decision/models";

export interface DecisionReplayedEvent {
  readonly type: "decision.replayed";
  readonly result: DecisionResult;
}

export function createDecisionReplayedEvent(result: DecisionResult): DecisionReplayedEvent {
  return Object.freeze({ type: "decision.replayed", result });
}
