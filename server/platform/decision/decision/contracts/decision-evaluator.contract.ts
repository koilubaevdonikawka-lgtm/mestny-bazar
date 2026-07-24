import type {
  DecisionDescriptor,
  DecisionEvidence,
} from "@server/platform/decision/decision/models";

export type EvaluationKind = "rule" | "policy" | "risk" | "compatibility";

/** Contract for decision evaluation (metadata only). */
export interface IDecisionEvaluator {
  evaluate(
    descriptor: DecisionDescriptor,
    evidence: readonly DecisionEvidence[],
    kind?: EvaluationKind,
  ): boolean;
  evaluateAll(descriptor: DecisionDescriptor, evidence: readonly DecisionEvidence[]): boolean;
}
