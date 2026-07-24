import type { PolicySeverityValue } from "./policy-descriptor.model";

/** Single policy evaluation violation. */
export interface PolicyViolation {
  readonly policyId: string;
  readonly code: string;
  readonly message: string;
  readonly severity: PolicySeverityValue;
  readonly source?: string;
}

export function createPolicyViolation(input: {
  policyId: string;
  code: string;
  message: string;
  severity: PolicySeverityValue;
  source?: string;
}): PolicyViolation {
  return Object.freeze({
    policyId: input.policyId.trim(),
    code: input.code.trim(),
    message: input.message.trim(),
    severity: input.severity,
    source: input.source?.trim() || undefined,
  });
}

/** Result of evaluating a single policy. */
export interface PolicyResult {
  readonly policyId: string;
  readonly passed: boolean;
  readonly evaluatedAt: string;
  readonly violations: readonly PolicyViolation[];
}

export function createPolicyResult(input: {
  policyId: string;
  passed: boolean;
  violations?: readonly PolicyViolation[];
}): PolicyResult {
  return Object.freeze({
    policyId: input.policyId.trim(),
    passed: input.passed,
    evaluatedAt: new Date().toISOString(),
    violations: Object.freeze([...(input.violations ?? [])]),
  });
}
