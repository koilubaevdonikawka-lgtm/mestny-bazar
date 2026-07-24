import type { PolicyDecision, PolicyEvaluation } from "@server/platform/policy/policy/models";

/** Contract for policy enforcement decisions (metadata only). */
export interface IPolicyEnforcementEngine {
  enforce(evaluation: PolicyEvaluation): PolicyDecision;
  enforceAll(evaluations: readonly PolicyEvaluation[]): readonly PolicyDecision[];
}
