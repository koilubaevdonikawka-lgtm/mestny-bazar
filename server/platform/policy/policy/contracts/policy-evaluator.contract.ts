import type { PolicyDescriptor, PolicyEvaluation } from "@server/platform/policy/policy/models";

/** Contract for policy metadata evaluation. */
export interface IPolicyEvaluator {
  evaluate(policy: PolicyDescriptor): PolicyEvaluation;
  evaluateAll(policies: readonly PolicyDescriptor[]): readonly PolicyEvaluation[];
}
