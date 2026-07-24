import type { DecisionReasoning } from "@server/platform/decision/decision/models";

export interface DecisionExplainedEvent {
  readonly type: "decision.explained";
  readonly reasoning: DecisionReasoning;
}

export function createDecisionExplainedEvent(reasoning: DecisionReasoning): DecisionExplainedEvent {
  return Object.freeze({ type: "decision.explained", reasoning });
}
