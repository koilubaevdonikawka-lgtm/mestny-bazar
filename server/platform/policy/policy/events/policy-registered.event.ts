import type { PolicyDescriptor } from "@server/platform/policy/policy/models";

export interface PolicyRegisteredEvent {
  readonly type: "policy.policy.registered";
  readonly policy: PolicyDescriptor;
}

export function createPolicyRegisteredEvent(policy: PolicyDescriptor): PolicyRegisteredEvent {
  return Object.freeze({ type: "policy.policy.registered", policy });
}
