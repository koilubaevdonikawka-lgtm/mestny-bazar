import type { PolicyDecision } from "@server/platform/policy/policy/models";

export interface PolicyEnforcedEvent {
  readonly type: "policy.policy.enforced";
  readonly decision: PolicyDecision;
}

export function createPolicyEnforcedEvent(decision: PolicyDecision): PolicyEnforcedEvent {
  return Object.freeze({ type: "policy.policy.enforced", decision });
}
