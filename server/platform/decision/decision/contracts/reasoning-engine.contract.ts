import type {
  DecisionDescriptor,
  DecisionEvidence,
  DecisionReasoning,
  DecisionResult,
} from "@server/platform/decision/decision/models";

/** Contract for decision reasoning (metadata only). */
export interface IReasoningEngine {
  explain(
    result: DecisionResult,
    evidence: readonly DecisionEvidence[],
    appliedRules: readonly string[],
  ): DecisionReasoning;
  get(decisionId: string): DecisionReasoning | undefined;
}
