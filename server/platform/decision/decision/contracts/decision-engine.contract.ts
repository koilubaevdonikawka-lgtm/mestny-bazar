import type {
  DecisionDescriptor,
  DecisionEvidence,
} from "@server/platform/decision/decision/models";

/** Contract for metadata decision engine. */
export interface IDecisionEngine {
  collectEvidence(descriptor: DecisionDescriptor): readonly DecisionEvidence[];
}
