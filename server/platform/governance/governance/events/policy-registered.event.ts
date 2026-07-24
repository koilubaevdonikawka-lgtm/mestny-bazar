export const PolicyRegisteredEventName = "platform.governance.policy.registered";

export interface PolicyRegisteredEvent {
  readonly name: typeof PolicyRegisteredEventName;
  readonly occurredAt: string;
  readonly policyId: string;
  readonly category: string;
}

export function createPolicyRegisteredEvent(input: {
  policyId: string;
  category: string;
}): PolicyRegisteredEvent {
  return Object.freeze({
    name: PolicyRegisteredEventName,
    occurredAt: new Date().toISOString(),
    policyId: input.policyId.trim(),
    category: input.category.trim(),
  });
}
