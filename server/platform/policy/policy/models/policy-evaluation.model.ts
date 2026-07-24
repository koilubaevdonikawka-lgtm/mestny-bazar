/** Result of policy metadata evaluation. */
export interface PolicyEvaluation {
  readonly policyId: string;
  readonly policyName: string;
  readonly passed: boolean;
  readonly score: number;
  readonly reason: string;
  readonly evaluatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createPolicyEvaluation(input: {
  policyId: string;
  policyName: string;
  passed: boolean;
  score?: number;
  reason: string;
  metadata?: Readonly<Record<string, unknown>>;
}): PolicyEvaluation {
  return Object.freeze({
    policyId: input.policyId.trim(),
    policyName: input.policyName.trim(),
    passed: input.passed,
    score: input.score ?? (input.passed ? 100 : 0),
    reason: input.reason.trim(),
    evaluatedAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
