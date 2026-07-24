export const PolicyViolationDetectedEventName = "platform.governance.policy.violation.detected";

export interface PolicyViolationDetectedEvent {
  readonly name: typeof PolicyViolationDetectedEventName;
  readonly occurredAt: string;
  readonly policyId: string;
  readonly code: string;
  readonly message: string;
}

export function createPolicyViolationDetectedEvent(input: {
  policyId: string;
  code: string;
  message: string;
}): PolicyViolationDetectedEvent {
  return Object.freeze({
    name: PolicyViolationDetectedEventName,
    occurredAt: new Date().toISOString(),
    policyId: input.policyId.trim(),
    code: input.code.trim(),
    message: input.message.trim(),
  });
}
