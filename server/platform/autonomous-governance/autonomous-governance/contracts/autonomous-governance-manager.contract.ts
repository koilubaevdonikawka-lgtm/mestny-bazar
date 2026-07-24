import type {
  GovernancePlan,
  GovernanceRecommendation,
  GovernanceSummary,
  PlatformCoordinationResult,
  PlatformMonitoringSnapshot,
} from "@server/platform/autonomous-governance/autonomous-governance/models";

/** Contract for autonomous governance orchestration. */
export interface IAutonomousGovernanceManager {
  evaluatePlatform(): PlatformMonitoringSnapshot;
  generatePlan(kind?: GovernancePlan["kind"]): GovernancePlan;
  coordinatePlatforms(): PlatformCoordinationResult;
  generateRecommendations(): readonly GovernanceRecommendation[];
  generateGovernanceReport(): GovernanceSummary;
}
