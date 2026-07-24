import type { IAutonomousGovernanceManager } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import type {
  GovernancePlan,
  GovernanceRecommendation,
  GovernanceSummary,
  PlatformCoordinationResult,
  PlatformMonitoringSnapshot,
} from "@server/platform/autonomous-governance/autonomous-governance/models";

/** Public autonomous governance platform facade. */
export class AutonomousGovernancePlatform {
  constructor(private readonly manager: IAutonomousGovernanceManager) {}

  evaluatePlatform(): PlatformMonitoringSnapshot {
    return this.manager.evaluatePlatform();
  }

  generatePlan(kind?: GovernancePlan["kind"]): GovernancePlan {
    return this.manager.generatePlan(kind);
  }

  coordinatePlatforms(): PlatformCoordinationResult {
    return this.manager.coordinatePlatforms();
  }

  generateRecommendations(): readonly GovernanceRecommendation[] {
    return this.manager.generateRecommendations();
  }

  generateGovernanceReport(): GovernanceSummary {
    return this.manager.generateGovernanceReport();
  }
}
