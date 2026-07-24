import type { PolicyException } from "@server/platform/policy/policy/models";

export interface PolicyExceptionRegisteredEvent {
  readonly type: "policy.exception.registered";
  readonly exception: PolicyException;
}

export function createPolicyExceptionRegisteredEvent(
  exception: PolicyException,
): PolicyExceptionRegisteredEvent {
  return Object.freeze({ type: "policy.exception.registered", exception });
}
