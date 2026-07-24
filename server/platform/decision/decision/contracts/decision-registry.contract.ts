import type {
  DecisionDescriptor,
  DecisionKind,
  DecisionResult,
} from "@server/platform/decision/decision/models";

/** Contract for decision registry. */
export interface IDecisionRegistry {
  register(descriptor: DecisionDescriptor): DecisionDescriptor;
  storeResult(result: DecisionResult): DecisionResult;
  getResult(decisionId: string): DecisionResult | undefined;
  listResults(kind?: DecisionKind): readonly DecisionResult[];
}
