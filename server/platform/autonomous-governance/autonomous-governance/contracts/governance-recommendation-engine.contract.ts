import type { GovernanceRecommendation } from "@server/platform/autonomous-governance/autonomous-governance/models";

/** Contract for governance recommendation generation. */
export interface IGovernanceRecommendationEngine {
  generate(): readonly GovernanceRecommendation[];
}
