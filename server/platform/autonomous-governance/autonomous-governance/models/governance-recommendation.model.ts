export type GovernanceRecommendationKind =
  | "improvement"
  | "architecture"
  | "risk"
  | "evolution";

/** Governance recommendation metadata. */
export interface GovernanceRecommendation {
  readonly id: string;
  readonly kind: GovernanceRecommendationKind;
  readonly title: string;
  readonly description: string;
  readonly priority: number;
  readonly generatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createGovernanceRecommendation(input: {
  id?: string;
  kind: GovernanceRecommendationKind;
  title: string;
  description?: string;
  priority?: number;
  metadata?: Readonly<Record<string, unknown>>;
}): GovernanceRecommendation {
  return Object.freeze({
    id: input.id ?? `gov-recommendation-${Date.now()}`,
    kind: input.kind,
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    priority: input.priority ?? 1,
    generatedAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
