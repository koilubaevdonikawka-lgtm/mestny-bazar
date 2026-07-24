import type { IRecommendationEngine } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import {
  createArchitectureRecommendation,
  type ArchitectureRecommendation,
  type ArchitectureRisk,
} from "@server/platform/architecture-intelligence/architecture-intelligence/models";
import { createRecommendationGeneratedEvent } from "@server/platform/architecture-intelligence/architecture-intelligence/events";

/** Generates architecture recommendations from detected risks (metadata only). */
export class RecommendationEngine implements IRecommendationEngine {
  generate(risks: readonly ArchitectureRisk[] = []): readonly ArchitectureRecommendation[] {
    const recommendations: ArchitectureRecommendation[] = [];

    for (const risk of risks) {
      recommendations.push(this.fromRisk(risk));
    }

    if (recommendations.length === 0) {
      recommendations.push(
        createArchitectureRecommendation({
          kind: "improvement",
          title: "Maintain architecture documentation",
          description: "Continue periodic architecture analysis and snapshot synchronization",
          priority: 1,
        }),
        createArchitectureRecommendation({
          kind: "optimization",
          title: "Review platform boundaries",
          description: "Validate platform boundary compliance across modules",
          priority: 2,
        }),
      );
    }

    createRecommendationGeneratedEvent(recommendations);
    return Object.freeze([...recommendations]);
  }

  private fromRisk(risk: ArchitectureRisk): ArchitectureRecommendation {
    const kindMap = {
      architecture: "improvement" as const,
      dependency: "refactoring" as const,
      provider: "migration" as const,
      version: "optimization" as const,
      complexity: "refactoring" as const,
    };
    const priorityMap = { low: 1, medium: 2, high: 3, critical: 4 };

    return createArchitectureRecommendation({
      kind: kindMap[risk.kind],
      title: `Address: ${risk.title}`,
      description: risk.description,
      priority: priorityMap[risk.severity],
      metadata: Object.freeze({ riskId: risk.id, riskKind: risk.kind }),
    });
  }
}
