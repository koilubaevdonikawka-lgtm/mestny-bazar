export const PolicyEvaluatedEventName = "platform.governance.policy.evaluated";

export interface PolicyEvaluatedEvent {
  readonly name: typeof PolicyEvaluatedEventName;
  readonly occurredAt: string;
  readonly policyId: string;
  readonly passed: boolean;
}

export function createPolicyEvaluatedEvent(input: {
  policyId: string;
  passed: boolean;
}): PolicyEvaluatedEvent {
  return Object.freeze({
    name: PolicyEvaluatedEventName,
    occurredAt: new Date().toISOString(),
    policyId: input.policyId.trim(),
    passed: input.passed,
  });
}
