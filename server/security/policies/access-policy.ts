import type { SecurityContext } from "@server/security/context";
import type { AuthorizationDecision } from "@server/security/shared";

/** Input passed to access policies for evaluation. */
export interface AccessPolicyInput {
  readonly context: SecurityContext;
  readonly action?: string;
  readonly resourceType?: string;
  readonly resourceId?: string;
  readonly ownerId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Result of a policy evaluation. */
export interface AccessPolicyResult {
  readonly decision: AuthorizationDecision;
  readonly reason?: string;
  readonly policyName: string;
}

/** Contract for pluggable access policies. */
export interface AccessPolicy {
  readonly name: string;
  evaluate(input: AccessPolicyInput): AccessPolicyResult;
}

/** Creates a policy result value. */
export function createPolicyResult(
  policyName: string,
  decision: AuthorizationDecision,
  reason?: string,
): AccessPolicyResult {
  return Object.freeze({
    policyName,
    decision,
    reason: reason?.trim() || undefined,
  });
}

/** Returns true when the policy allows access. */
export function isAllowed(result: AccessPolicyResult): boolean {
  return result.decision === "allow";
}
