import type {
  DecisionConfidence,
  DecisionEvidence,
} from "@server/platform/decision/decision/models";

/** Contract for decision confidence scoring. */
export interface IConfidenceEngine {
  calculate(
    decisionId: string,
    evidence: readonly DecisionEvidence[],
    riskCount: number,
  ): DecisionConfidence;
}
