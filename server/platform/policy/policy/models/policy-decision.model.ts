export type PolicyEnforcementAction = "allow" | "warn" | "deny" | "audit";

/** Policy enforcement decision metadata (no business actions). */
export interface PolicyDecision {
  readonly policyId: string;
  readonly action: PolicyEnforcementAction;
  readonly enforced: boolean;
  readonly message: string;
  readonly enforcedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createPolicyDecision(input: {
  policyId: string;
  action: PolicyEnforcementAction;
  enforced?: boolean;
  message: string;
  metadata?: Readonly<Record<string, unknown>>;
}): PolicyDecision {
  return Object.freeze({
    policyId: input.policyId.trim(),
    action: input.action,
    enforced: input.enforced ?? true,
    message: input.message.trim(),
    enforcedAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
