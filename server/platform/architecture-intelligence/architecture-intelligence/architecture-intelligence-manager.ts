import type { IArchitectureIntelligenceManager } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import type { IArchitectureIntelligenceRegistry } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import type { IArchitectureAnalyzer } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import type { IArchitectureRiskEngine } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import type { IRecommendationEngine } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import type { IArchitectureForecastEngine } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import type { IArchitectureScoringEngine } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import {
  createArchitectureSnapshotEntry,
  createForecastModelEntry,
  createRiskProfileEntry,
  type ArchitectureAnalysis,
  type ArchitectureForecast,
  type ArchitectureRecommendation,
  type ArchitectureRisk,
  type ArchitectureScore,
  type ArchitectureRiskSeverity,
} from "@server/platform/architecture-intelligence/architecture-intelligence/models";

/** Orchestrates architecture intelligence analysis and recommendations. */
export class ArchitectureIntelligenceManager implements IArchitectureIntelligenceManager {
  constructor(
    private readonly registry: IArchitectureIntelligenceRegistry,
    private readonly analyzer: IArchitectureAnalyzer,
    private readonly riskEngine: IArchitectureRiskEngine,
    private readonly recommendationEngine: IRecommendationEngine,
    private readonly forecastEngine: IArchitectureForecastEngine,
    private readonly scoringEngine: IArchitectureScoringEngine,
  ) {}

  analyzeArchitecture(): ArchitectureAnalysis {
    const analysis = this.analyzer.analyze();
    this.registry.registerAnalysis(analysis);
    this.registry.registerSnapshot(
      createArchitectureSnapshotEntry({
        label: `analysis-${analysis.id}`,
        source: "architecture-analyzer",
      }),
    );
    return analysis;
  }

  detectRisks(): readonly ArchitectureRisk[] {
    const risks = this.riskEngine.detect();
    const highestSeverity = this.resolveHighestSeverity(risks);
    this.registry.registerRiskProfile(
      createRiskProfileEntry({
        riskCount: risks.length,
        highestSeverity,
      }),
    );
    return risks;
  }

  generateRecommendations(): readonly ArchitectureRecommendation[] {
    const risks = this.detectRisks();
    return this.recommendationEngine.generate(risks);
  }

  forecastChanges(kind?: ArchitectureForecast["kind"]): ArchitectureForecast {
    const forecast = this.forecastEngine.forecast(kind);
    this.registry.registerForecastModel(createForecastModelEntry({ kind: forecast.kind }));
    return forecast;
  }

  calculateArchitectureScore(): ArchitectureScore {
    const analysis = this.registry.listAnalyses().at(-1) ?? this.analyzeArchitecture();
    const score = this.scoringEngine.calculate(analysis);
    this.registry.registerScore(score);
    return score;
  }

  private resolveHighestSeverity(risks: readonly ArchitectureRisk[]): ArchitectureRiskSeverity {
    const order = { low: 0, medium: 1, high: 2, critical: 3 };
    return risks.reduce(
      (current, risk) => (order[risk.severity] > order[current] ? risk.severity : current),
      "low" as const,
    );
  }
}
