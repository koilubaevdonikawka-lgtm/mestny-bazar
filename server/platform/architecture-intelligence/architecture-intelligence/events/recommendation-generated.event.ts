import type { ArchitectureRecommendation } from "@server/platform/architecture-intelligence/architecture-intelligence/models";

export interface RecommendationGeneratedEvent {
  readonly type: "architecture-intelligence.recommendation.generated";
  readonly recommendations: readonly ArchitectureRecommendation[];
}

export function createRecommendationGeneratedEvent(
  recommendations: readonly ArchitectureRecommendation[],
): RecommendationGeneratedEvent {
  return Object.freeze({
    type: "architecture-intelligence.recommendation.generated",
    recommendations,
  });
}
