import type {
  ArchitectureAnalysis,
  ArchitectureForecast,
  ArchitectureRecommendation,
  ArchitectureRisk,
  ArchitectureScore,
} from "@server/platform/architecture-intelligence/architecture-intelligence/models";

/** Contract for architecture intelligence orchestration. */
export interface IArchitectureIntelligenceManager {
  analyzeArchitecture(): ArchitectureAnalysis;
  detectRisks(): readonly ArchitectureRisk[];
  generateRecommendations(): readonly ArchitectureRecommendation[];
  forecastChanges(kind?: ArchitectureForecast["kind"]): ArchitectureForecast;
  calculateArchitectureScore(): ArchitectureScore;
}
