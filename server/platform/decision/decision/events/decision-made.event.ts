import type { DecisionResult } from "@server/platform/decision/decision/models";

export interface DecisionMadeEvent {
  readonly type: "decision.made";
  readonly result: DecisionResult;
}

export function createDecisionMadeEvent(result: DecisionResult): DecisionMadeEvent {
  return Object.freeze({ type: "decision.made", result });
}
