import type { DecisionEvaluation } from "@server/platform/decision/decision/models";

export interface DecisionEvaluatedEvent {
  readonly type: "decision.evaluated";
  readonly evaluation: DecisionEvaluation;
}

export function createDecisionEvaluatedEvent(evaluation: DecisionEvaluation): DecisionEvaluatedEvent {
  return Object.freeze({ type: "decision.evaluated", evaluation });
}
