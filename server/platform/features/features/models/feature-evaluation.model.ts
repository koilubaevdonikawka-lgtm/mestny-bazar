/** Result of feature flag evaluation (metadata only). */
export interface FeatureEvaluation {
  readonly featureId: string;
  readonly featureName: string;
  readonly enabled: boolean;
  readonly reason: string;
  readonly evaluatedAt: string;
  readonly context: Readonly<Record<string, unknown>>;
}

export function createFeatureEvaluation(input: {
  featureId: string;
  featureName: string;
  enabled: boolean;
  reason: string;
  context?: Readonly<Record<string, unknown>>;
}): FeatureEvaluation {
  return Object.freeze({
    featureId: input.featureId.trim(),
    featureName: input.featureName.trim(),
    enabled: input.enabled,
    reason: input.reason.trim(),
    evaluatedAt: new Date().toISOString(),
    context: Object.freeze({ ...(input.context ?? {}) }),
  });
}
