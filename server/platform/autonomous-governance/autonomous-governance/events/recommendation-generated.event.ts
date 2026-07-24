import type { GovernanceRecommendation } from "@server/platform/autonomous-governance/autonomous-governance/models";

export interface GovernanceRecommendationGeneratedEvent {
  readonly type: "autonomous-governance.recommendation.generated";
  readonly recommendations: readonly GovernanceRecommendation[];
}

export function createGovernanceRecommendationGeneratedEvent(
  recommendations: readonly GovernanceRecommendation[],
): GovernanceRecommendationGeneratedEvent {
  return Object.freeze({
    type: "autonomous-governance.recommendation.generated",
    recommendations,
  });
}
