export type PolicyExceptionKind = "approved" | "temporary" | "deprecated";

/** Registered policy exception metadata. */
export interface PolicyException {
  readonly id: string;
  readonly policyId: string;
  readonly kind: PolicyExceptionKind;
  readonly reason: string;
  readonly expiresAt?: string;
  readonly registeredAt: string;
}

export function createPolicyException(input: {
  id?: string;
  policyId: string;
  kind: PolicyExceptionKind;
  reason: string;
  expiresAt?: string;
}): PolicyException {
  return Object.freeze({
    id: input.id ?? `exception-${Date.now()}`,
    policyId: input.policyId.trim(),
    kind: input.kind,
    reason: input.reason.trim(),
    expiresAt: input.expiresAt,
    registeredAt: new Date().toISOString(),
  });
}
