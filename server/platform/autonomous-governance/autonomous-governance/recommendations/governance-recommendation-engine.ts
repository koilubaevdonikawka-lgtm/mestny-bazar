import type { IGovernanceRecommendationEngine } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import {
  createGovernanceRecommendation,
  type GovernanceRecommendation,
} from "@server/platform/autonomous-governance/autonomous-governance/models";
import { createGovernanceRecommendationGeneratedEvent } from "@server/platform/autonomous-governance/autonomous-governance/events";
import type { ArchitectureIntelligencePlatform } from "@server/platform/architecture-intelligence/architecture-intelligence/architecture-intelligence-platform";
import type { DecisionPlatform } from "@server/platform/decision/decision/decision-platform";
import type { CompliancePlatform } from "@server/platform/compliance/compliance/compliance-platform";

/** Generates governance recommendations from platform metadata. */
export class GovernanceRecommendationEngine implements IGovernanceRecommendationEngine {
  constructor(
    private readonly architectureIntelligence: ArchitectureIntelligencePlatform,
    private readonly decisionPlatform: DecisionPlatform,
    private readonly compliancePlatform: CompliancePlatform,
  ) {}

  generate(): readonly GovernanceRecommendation[] {
    const archRecommendations = this.architectureIntelligence.generateRecommendations();
    const risks = this.architectureIntelligence.detectRisks();
    const decisions = this.decisionPlatform.listDecisions();
    const readiness = this.compliancePlatform.readinessScore();

    const recommendations: GovernanceRecommendation[] = [
      ...archRecommendations.slice(0, 3).map((item) =>
        createGovernanceRecommendation({
          kind: "architecture",
          title: item.title,
          description: item.description,
          priority: item.priority,
        }),
      ),
      createGovernanceRecommendation({
        kind: "improvement",
        title: "Maintain platform coordination cycle",
        description: "Continue periodic governance evaluation and reporting",
        priority: 1,
      }),
    ];

    if (risks.length > 0) {
      recommendations.push(
        createGovernanceRecommendation({
          kind: "risk",
          title: `Review ${risks.length} architecture risks`,
          description: risks[0]?.description ?? "Risk mitigation recommended",
          priority: 3,
        }),
      );
    }

    if (readiness < 80) {
      recommendations.push(
        createGovernanceRecommendation({
          kind: "evolution",
          title: "Improve compliance readiness",
          description: `Current readiness: ${readiness}`,
          priority: 2,
        }),
      );
    }

    if (decisions.length === 0) {
      recommendations.push(
        createGovernanceRecommendation({
          kind: "evolution",
          title: "Establish decision baseline",
          description: "Record initial platform decisions for governance traceability",
          priority: 2,
        }),
      );
    }

    createGovernanceRecommendationGeneratedEvent(recommendations);
    return Object.freeze([...recommendations]);
  }
}
