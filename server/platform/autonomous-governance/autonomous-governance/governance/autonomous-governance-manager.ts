import type { IAutonomousGovernanceManager } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import type { IAutonomousGovernanceRegistry } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import type { IPlatformMonitoringEngine } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import type { IGovernancePlanningEngine } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import type { IPlatformCoordinationEngine } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import type { IGovernanceRecommendationEngine } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import type { IGovernanceHealthEngine } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import {
  createGovernanceSession,
  createGovernanceSummary,
  createPlatformSystemEntry,
  type GovernancePlan,
  type GovernanceRecommendation,
  type GovernanceSummary,
  type PlatformCoordinationResult,
  type PlatformMonitoringSnapshot,
} from "@server/platform/autonomous-governance/autonomous-governance/models";

/** Orchestrates autonomous platform governance (metadata only). */
export class AutonomousGovernanceManager implements IAutonomousGovernanceManager {
  constructor(
    private readonly registry: IAutonomousGovernanceRegistry,
    private readonly monitoringEngine: IPlatformMonitoringEngine,
    private readonly planningEngine: IGovernancePlanningEngine,
    private readonly coordinationEngine: IPlatformCoordinationEngine,
    private readonly recommendationEngine: IGovernanceRecommendationEngine,
    private readonly healthEngine: IGovernanceHealthEngine,
  ) {}

  evaluatePlatform(): PlatformMonitoringSnapshot {
    const snapshot = this.monitoringEngine.collect();
    this.registry.registerSession(
      createGovernanceSession({
        platformCount: 8,
        status: "active",
      }),
    );
    return snapshot;
  }

  generatePlan(kind?: GovernancePlan["kind"]): GovernancePlan {
    const plan = this.planningEngine.generate(kind);
    this.registry.registerPlan(plan);
    return plan;
  }

  coordinatePlatforms(): PlatformCoordinationResult {
    const result = this.coordinationEngine.coordinate();
    for (const platformId of result.coordinatedPlatforms) {
      this.registry.registerSystem(
        createPlatformSystemEntry({
          id: platformId,
          name: platformId,
          status: "coordinated",
        }),
      );
    }
    return result;
  }

  generateRecommendations(): readonly GovernanceRecommendation[] {
    return this.recommendationEngine.generate();
  }

  generateGovernanceReport(): GovernanceSummary {
    const snapshot = this.evaluatePlatform();
    const health = this.healthEngine.calculate();
    this.registry.registerHealth(health);
    const plans = [
      this.generatePlan("governance"),
      this.generatePlan("improvement"),
    ];
    const recommendations = this.generateRecommendations();
    const session = createGovernanceSession({
      platformCount: this.registry.listSystems().length,
      status: "completed",
      metadata: Object.freeze({ snapshot }),
    });
    this.registry.registerSession(session);

    const summary = createGovernanceSummary({
      session,
      health,
      plans,
      recommendations,
    });
    this.registry.registerReport(summary);
    return summary;
  }
}
