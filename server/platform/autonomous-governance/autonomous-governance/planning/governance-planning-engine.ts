import type { IGovernancePlanningEngine } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import {
  createGovernancePlan,
  type GovernancePlan,
  type GovernancePlanKind,
} from "@server/platform/autonomous-governance/autonomous-governance/models";
import { createGovernancePlanGeneratedEvent } from "@server/platform/autonomous-governance/autonomous-governance/events";
import type { ArchitectureIntelligencePlatform } from "@server/platform/architecture-intelligence/architecture-intelligence/architecture-intelligence-platform";
import type { DecisionPlatform } from "@server/platform/decision/decision/decision-platform";

/** Generates governance action plans (metadata only, no execution). */
export class GovernancePlanningEngine implements IGovernancePlanningEngine {
  constructor(
    private readonly architectureIntelligence: ArchitectureIntelligencePlatform,
    private readonly decisionPlatform: DecisionPlatform,
  ) {}

  generate(kind: GovernancePlanKind = "governance"): GovernancePlan {
    const risks = this.architectureIntelligence.detectRisks();
    const recommendations = this.architectureIntelligence.generateRecommendations();
    const decisions = this.decisionPlatform.listDecisions();

    const actions = this.buildActions(kind, risks.length, recommendations.length, decisions.length);
    const plan = createGovernancePlan({
      kind,
      title: `${kind} plan`,
      actions,
      metadata: Object.freeze({ readOnly: true, sideEffects: false }),
    });

    createGovernancePlanGeneratedEvent(plan);
    return plan;
  }

  private buildActions(
    kind: GovernancePlanKind,
    riskCount: number,
    recommendationCount: number,
    decisionCount: number,
  ): readonly string[] {
    switch (kind) {
      case "improvement":
        return Object.freeze([
          `Review ${recommendationCount} architecture recommendations`,
          "Schedule platform health assessment",
        ]);
      case "risk":
        return Object.freeze([
          `Address ${riskCount} detected risks`,
          "Validate compliance readiness",
        ]);
      case "evolution":
        return Object.freeze([
          "Forecast architecture changes",
          `Align ${decisionCount} prior decisions with evolution path`,
        ]);
      case "governance":
      default:
        return Object.freeze([
          "Coordinate platform systems",
          "Generate governance report",
          "Update governance session registry",
        ]);
    }
  }
}
