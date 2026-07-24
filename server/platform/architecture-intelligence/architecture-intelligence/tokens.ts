/** DI tokens for the architecture intelligence platform. */
export const ArchitectureIntelligenceTokens = {
  ArchitectureIntelligencePlatform: Symbol.for("architecture-intelligence.platform"),
  ArchitectureIntelligenceManager: Symbol.for("architecture-intelligence.manager"),
  ArchitectureIntelligenceRegistry: Symbol.for("architecture-intelligence.registry"),
  ArchitectureAnalyzer: Symbol.for("architecture-intelligence.analyzer"),
  ArchitectureRiskEngine: Symbol.for("architecture-intelligence.riskEngine"),
  RecommendationEngine: Symbol.for("architecture-intelligence.recommendationEngine"),
  ArchitectureForecastEngine: Symbol.for("architecture-intelligence.forecastEngine"),
  ArchitectureScoringEngine: Symbol.for("architecture-intelligence.scoringEngine"),
} as const;

export type ArchitectureIntelligenceToken =
  (typeof ArchitectureIntelligenceTokens)[keyof typeof ArchitectureIntelligenceTokens];
