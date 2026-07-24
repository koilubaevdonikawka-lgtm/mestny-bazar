export {
  type AnalysisDimension,
  type ArchitectureAnalysis,
  createArchitectureAnalysis,
} from "./architecture-analysis.model";
export {
  type ArchitectureRiskKind,
  type ArchitectureRiskSeverity,
  type ArchitectureRisk,
  createArchitectureRisk,
} from "./architecture-risk.model";
export {
  type RecommendationKind,
  type ArchitectureRecommendation,
  createArchitectureRecommendation,
} from "./architecture-recommendation.model";
export {
  type ForecastKind,
  type ArchitectureForecast,
  createArchitectureForecast,
} from "./architecture-forecast.model";
export {
  type ArchitectureScore,
  createArchitectureScore,
} from "./architecture-score.model";

import type { ArchitectureRiskSeverity } from "./architecture-risk.model";
import type { ForecastKind } from "./architecture-forecast.model";

export type ArchitectureSnapshotEntry = {
  readonly id: string;
  readonly label: string;
  readonly capturedAt: string;
  readonly source: string;
};

export function createArchitectureSnapshotEntry(input: {
  id?: string;
  label: string;
  source: string;
}): ArchitectureSnapshotEntry {
  return Object.freeze({
    id: input.id ?? `arch-snapshot-${Date.now()}`,
    label: input.label.trim(),
    capturedAt: new Date().toISOString(),
    source: input.source.trim(),
  });
}

export type RiskProfileEntry = {
  readonly id: string;
  readonly riskCount: number;
  readonly highestSeverity: ArchitectureRiskSeverity;
  readonly updatedAt: string;
};

export function createRiskProfileEntry(input: {
  id?: string;
  riskCount: number;
  highestSeverity: ArchitectureRiskSeverity;
}): RiskProfileEntry {
  return Object.freeze({
    id: input.id ?? `risk-profile-${Date.now()}`,
    riskCount: input.riskCount,
    highestSeverity: input.highestSeverity,
    updatedAt: new Date().toISOString(),
  });
}

export type ForecastModelEntry = {
  readonly id: string;
  readonly kind: ForecastKind;
  readonly registeredAt: string;
};

export function createForecastModelEntry(input: {
  id?: string;
  kind: ForecastKind;
}): ForecastModelEntry {
  return Object.freeze({
    id: input.id ?? `forecast-model-${Date.now()}`,
    kind: input.kind,
    registeredAt: new Date().toISOString(),
  });
}
