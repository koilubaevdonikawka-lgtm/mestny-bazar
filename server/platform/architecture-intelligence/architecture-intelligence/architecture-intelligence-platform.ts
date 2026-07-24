import type { IArchitectureIntelligenceManager } from "@server/platform/architecture-intelligence/architecture-intelligence/contracts";
import type {
  ArchitectureAnalysis,
  ArchitectureForecast,
  ArchitectureRecommendation,
  ArchitectureRisk,
  ArchitectureScore,
} from "@server/platform/architecture-intelligence/architecture-intelligence/models";

/** Public architecture intelligence platform facade. */
export class ArchitectureIntelligencePlatform {
  constructor(private readonly manager: IArchitectureIntelligenceManager) {}

  analyzeArchitecture(): ArchitectureAnalysis {
    return this.manager.analyzeArchitecture();
  }

  detectRisks(): readonly ArchitectureRisk[] {
    return this.manager.detectRisks();
  }

  generateRecommendations(): readonly ArchitectureRecommendation[] {
    return this.manager.generateRecommendations();
  }

  forecastChanges(kind?: ArchitectureForecast["kind"]): ArchitectureForecast {
    return this.manager.forecastChanges(kind);
  }

  calculateArchitectureScore(): ArchitectureScore {
    return this.manager.calculateArchitectureScore();
  }
}
