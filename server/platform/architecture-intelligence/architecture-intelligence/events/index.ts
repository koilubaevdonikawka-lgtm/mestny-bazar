export {
  type ArchitectureAnalyzedEvent,
  createArchitectureAnalyzedEvent,
} from "./architecture-analyzed.event";
export {
  type ArchitectureRiskDetectedEvent,
  createArchitectureRiskDetectedEvent,
} from "./architecture-risk-detected.event";
export {
  type RecommendationGeneratedEvent,
  createRecommendationGeneratedEvent,
} from "./recommendation-generated.event";
export {
  type ArchitectureForecastGeneratedEvent,
  createArchitectureForecastGeneratedEvent,
} from "./architecture-forecast-generated.event";
export {
  type ArchitectureScoreCalculatedEvent,
  createArchitectureScoreCalculatedEvent,
} from "./architecture-score-calculated.event";

export type ArchitectureIntelligencePlatformEvent =
  | ArchitectureAnalyzedEvent
  | ArchitectureRiskDetectedEvent
  | RecommendationGeneratedEvent
  | ArchitectureForecastGeneratedEvent
  | ArchitectureScoreCalculatedEvent;
