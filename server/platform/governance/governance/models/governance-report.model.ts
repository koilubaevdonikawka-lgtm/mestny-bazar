import type { PolicyResult } from "./policy-result.model";

/** Aggregated governance evaluation report. */
export interface GovernanceReport {
  readonly id: string;
  readonly generatedAt: string;
  readonly totalPolicies: number;
  readonly passed: number;
  readonly failed: number;
  readonly results: readonly PolicyResult[];
}

export function createGovernanceReport(input: {
  id?: string;
  results: readonly PolicyResult[];
}): GovernanceReport {
  const passed = input.results.filter((result) => result.passed).length;
  return Object.freeze({
    id: input.id ?? `governance-report-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    totalPolicies: input.results.length,
    passed,
    failed: input.results.length - passed,
    results: Object.freeze([...input.results]),
  });
}
