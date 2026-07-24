/** Result of compliance standard assessment (metadata only). */
export interface ComplianceAssessment {
  readonly standardId: string;
  readonly standardName: string;
  readonly passed: boolean;
  readonly score: number;
  readonly reason: string;
  readonly assessedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createComplianceAssessment(input: {
  standardId: string;
  standardName: string;
  passed: boolean;
  score?: number;
  reason: string;
  metadata?: Readonly<Record<string, unknown>>;
}): ComplianceAssessment {
  return Object.freeze({
    standardId: input.standardId.trim(),
    standardName: input.standardName.trim(),
    passed: input.passed,
    score: input.score ?? (input.passed ? 100 : 0),
    reason: input.reason.trim(),
    assessedAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
