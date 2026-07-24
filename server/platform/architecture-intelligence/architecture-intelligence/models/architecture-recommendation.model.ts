export type RecommendationKind =
  | "improvement"
  | "refactoring"
  | "optimization"
  | "migration";

/** Architecture recommendation metadata. */
export interface ArchitectureRecommendation {
  readonly id: string;
  readonly kind: RecommendationKind;
  readonly title: string;
  readonly description: string;
  readonly priority: number;
  readonly generatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createArchitectureRecommendation(input: {
  id?: string;
  kind: RecommendationKind;
  title: string;
  description?: string;
  priority?: number;
  metadata?: Readonly<Record<string, unknown>>;
}): ArchitectureRecommendation {
  return Object.freeze({
    id: input.id ?? `recommendation-${Date.now()}`,
    kind: input.kind,
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    priority: input.priority ?? 1,
    generatedAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
