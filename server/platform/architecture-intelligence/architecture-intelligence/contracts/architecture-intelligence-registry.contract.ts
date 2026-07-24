import type {
  ArchitectureAnalysis,
  ArchitectureScore,
  ArchitectureSnapshotEntry,
  ForecastModelEntry,
  RiskProfileEntry,
} from "@server/platform/architecture-intelligence/architecture-intelligence/models";

/** Contract for architecture intelligence registry. */
export interface IArchitectureIntelligenceRegistry {
  registerSnapshot(entry: ArchitectureSnapshotEntry): ArchitectureSnapshotEntry;
  registerAnalysis(analysis: ArchitectureAnalysis): ArchitectureAnalysis;
  registerScore(score: ArchitectureScore): ArchitectureScore;
  registerRiskProfile(profile: RiskProfileEntry): RiskProfileEntry;
  registerForecastModel(model: ForecastModelEntry): ForecastModelEntry;
  listSnapshots(): readonly ArchitectureSnapshotEntry[];
  listAnalyses(): readonly ArchitectureAnalysis[];
  listScores(): readonly ArchitectureScore[];
  listRiskProfiles(): readonly RiskProfileEntry[];
  listForecastModels(): readonly ForecastModelEntry[];
}
