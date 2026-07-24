import type { IArchitectureScoringEngine } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import {
  createArchitectureScore,
  type ArchitectureAnalysis,
  type ArchitectureScore,
} from "@server/platform/architecture-intelligence/architecture-intelligence/models";
import { createArchitectureScoreCalculatedEvent } from "@server/platform/architecture-intelligence/architecture-intelligence/events";
import type { CompliancePlatform } from "@server/platform/compliance/compliance/compliance-platform";

/** Calculates architecture quality scores from analysis metadata. */
export class ArchitectureScoringEngine implements IArchitectureScoringEngine {
  constructor(private readonly compliancePlatform: CompliancePlatform) {}

  calculate(analysis?: ArchitectureAnalysis): ArchitectureScore {
    const metrics = analysis?.metrics ?? {};
    const dependencyCount = Number(metrics.dependencyCount ?? 0);
    const modularityIndex = Number(metrics.modularityIndex ?? 50);
    const couplingIndex = Number(metrics.couplingIndex ?? 50);
    const complianceReadiness = this.compliancePlatform.readinessScore();

    const architectureScore = Math.max(0, 100 - Math.min(dependencyCount, 80));
    const maintainabilityScore = Math.round((modularityIndex + (100 - couplingIndex)) / 2);
    const modularityScore = Math.round(modularityIndex);
    const scalabilityScore = Math.max(0, 100 - couplingIndex);
    const evolutionReadinessScore = Math.round((complianceReadiness + modularityScore) / 2);

    const score = createArchitectureScore({
      architectureScore,
      maintainabilityScore,
      modularityScore,
      scalabilityScore,
      evolutionReadinessScore,
      metadata: Object.freeze({ analysisId: analysis?.id }),
    });

    createArchitectureScoreCalculatedEvent(score);
    return score;
  }
}
