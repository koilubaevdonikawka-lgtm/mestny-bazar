/** Decision confidence breakdown metadata. */
export interface DecisionConfidence {
  readonly id: string;
  readonly decisionId: string;
  readonly confidenceScore: number;
  readonly riskScore: number;
  readonly evidenceScore: number;
  readonly decisionQuality: number;
  readonly calculatedAt: string;
}

export function createDecisionConfidence(input: {
  id?: string;
  decisionId: string;
  confidenceScore: number;
  riskScore: number;
  evidenceScore: number;
  decisionQuality?: number;
}): DecisionConfidence {
  const decisionQuality =
    input.decisionQuality ??
    Math.round((input.confidenceScore + input.evidenceScore - input.riskScore) / 2);
  return Object.freeze({
    id: input.id ?? `confidence-${Date.now()}`,
    decisionId: input.decisionId.trim(),
    confidenceScore: input.confidenceScore,
    riskScore: input.riskScore,
    evidenceScore: input.evidenceScore,
    decisionQuality: Math.max(0, Math.min(100, decisionQuality)),
    calculatedAt: new Date().toISOString(),
  });
}

export type DecisionEvaluation = {
  readonly descriptor: import("./decision-descriptor.model").DecisionDescriptor;
  readonly evidence: readonly DecisionEvidence[];
  readonly passed: boolean;
  readonly evaluatedAt: string;
};

export function createDecisionEvaluation(input: {
  descriptor: import("./decision-descriptor.model").DecisionDescriptor;
  evidence?: readonly DecisionEvidence[];
  passed?: boolean;
}): DecisionEvaluation {
  return Object.freeze({
    descriptor: input.descriptor,
    evidence: Object.freeze([...(input.evidence ?? [])]),
    passed: input.passed ?? true,
    evaluatedAt: new Date().toISOString(),
  });
}
