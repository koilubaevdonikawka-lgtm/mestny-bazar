import type { IArchitectureIntelligenceRegistry } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import {
  createArchitectureSnapshotEntry,
  createForecastModelEntry,
  createRiskProfileEntry,
  type ArchitectureAnalysis,
  type ArchitectureScore,
  type ArchitectureSnapshotEntry,
  type ForecastModelEntry,
  type RiskProfileEntry,
} from "@server/platform/architecture-intelligence/architecture-intelligence/models";

/** Central registry for architecture intelligence artifacts. */
export class ArchitectureIntelligenceRegistry implements IArchitectureIntelligenceRegistry {
  private readonly snapshots: ArchitectureSnapshotEntry[] = [];
  private readonly analyses: ArchitectureAnalysis[] = [];
  private readonly scores: ArchitectureScore[] = [];
  private readonly riskProfiles: RiskProfileEntry[] = [];
  private readonly forecastModels: ForecastModelEntry[] = [];

  registerSnapshot(entry: ArchitectureSnapshotEntry): ArchitectureSnapshotEntry {
    const stored = createArchitectureSnapshotEntry(entry);
    this.snapshots.push(stored);
    return stored;
  }

  registerAnalysis(analysis: ArchitectureAnalysis): ArchitectureAnalysis {
    this.analyses.push(analysis);
    return analysis;
  }

  registerScore(score: ArchitectureScore): ArchitectureScore {
    this.scores.push(score);
    return score;
  }

  registerRiskProfile(profile: RiskProfileEntry): RiskProfileEntry {
    const stored = createRiskProfileEntry(profile);
    this.riskProfiles.push(stored);
    return stored;
  }

  registerForecastModel(model: ForecastModelEntry): ForecastModelEntry {
    const stored = createForecastModelEntry(model);
    this.forecastModels.push(stored);
    return stored;
  }

  listSnapshots(): readonly ArchitectureSnapshotEntry[] {
    return Object.freeze([...this.snapshots]);
  }

  listAnalyses(): readonly ArchitectureAnalysis[] {
    return Object.freeze([...this.analyses]);
  }

  listScores(): readonly ArchitectureScore[] {
    return Object.freeze([...this.scores]);
  }

  listRiskProfiles(): readonly RiskProfileEntry[] {
    return Object.freeze([...this.riskProfiles]);
  }

  listForecastModels(): readonly ForecastModelEntry[] {
    return Object.freeze([...this.forecastModels]);
  }
}
