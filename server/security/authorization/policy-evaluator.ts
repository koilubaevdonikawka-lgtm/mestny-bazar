import {
  isAllowed,
  type AccessPolicy,
  type AccessPolicyInput,
  type AccessPolicyResult,
} from "@server/security/policies";

/** Executes registered access policies against a security context. */
export class PolicyEvaluator {
  evaluate(policy: AccessPolicy, input: AccessPolicyInput): AccessPolicyResult {
    return policy.evaluate(input);
  }

  evaluateAll(
    policies: readonly AccessPolicy[],
    input: AccessPolicyInput,
  ): readonly AccessPolicyResult[] {
    return Object.freeze(policies.map((policy) => policy.evaluate(input)));
  }

  isAllowed(policy: AccessPolicy, input: AccessPolicyInput): boolean {
    return isAllowed(policy.evaluate(input));
  }
}
