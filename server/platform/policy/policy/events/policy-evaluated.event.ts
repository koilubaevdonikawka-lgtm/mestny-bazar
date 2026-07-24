import type { PolicyEvaluation } from "@server/platform/policy/policy/models";

export interface PolicyEvaluatedEvent {
  readonly type: "policy.policy.evaluated";
  readonly evaluation: PolicyEvaluation;
}

export function createPolicyEvaluatedEvent(evaluation: PolicyEvaluation): PolicyEvaluatedEvent {
  return Object.freeze({ type: "policy.policy.evaluated", evaluation });
}
