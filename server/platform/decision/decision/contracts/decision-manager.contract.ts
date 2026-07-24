import type {
  DecisionDescriptor,
  DecisionEvaluation,
  DecisionReasoning,
  DecisionResult,
} from "@server/platform/decision/decision/models";

/** Contract for decision orchestration. */
export interface IDecisionManager {
  evaluate(descriptor: DecisionDescriptor): DecisionEvaluation;
  decide(descriptor: DecisionDescriptor): DecisionResult;
  explainDecision(decisionId: string): DecisionReasoning | undefined;
  listDecisions(kind?: DecisionDescriptor["kind"]): readonly DecisionResult[];
  replayDecision(decisionId: string): DecisionResult | undefined;
}
