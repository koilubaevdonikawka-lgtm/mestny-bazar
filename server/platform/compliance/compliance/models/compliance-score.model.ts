/** Compliance scoring metadata. */
export interface ComplianceScore {
  readonly categoryScore: number;
  readonly overallScore: number;
  readonly weightedScore: number;
  readonly readinessScore: number;
  readonly calculatedAt: string;
  readonly breakdown: Readonly<Record<string, number>>;
}

export function createComplianceScore(input: {
  categoryScore: number;
  overallScore: number;
  weightedScore: number;
  readinessScore: number;
  breakdown?: Readonly<Record<string, number>>;
}): ComplianceScore {
  return Object.freeze({
    categoryScore: input.categoryScore,
    overallScore: input.overallScore,
    weightedScore: input.weightedScore,
    readinessScore: input.readinessScore,
    calculatedAt: new Date().toISOString(),
    breakdown: Object.freeze({ ...(input.breakdown ?? {}) }),
  });
}
