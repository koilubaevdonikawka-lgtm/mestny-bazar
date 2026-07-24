/** DI tokens for the autonomous governance platform. */
export const AutonomousGovernanceTokens = {
  AutonomousGovernancePlatform: Symbol.for("autonomous-governance.platform"),
  AutonomousGovernanceManager: Symbol.for("autonomous-governance.manager"),
  AutonomousGovernanceRegistry: Symbol.for("autonomous-governance.registry"),
  PlatformMonitoringEngine: Symbol.for("autonomous-governance.monitoringEngine"),
  GovernancePlanningEngine: Symbol.for("autonomous-governance.planningEngine"),
  PlatformCoordinationEngine: Symbol.for("autonomous-governance.coordinationEngine"),
  GovernanceRecommendationEngine: Symbol.for("autonomous-governance.recommendationEngine"),
  GovernanceHealthEngine: Symbol.for("autonomous-governance.healthEngine"),
} as const;

export type AutonomousGovernanceToken =
  (typeof AutonomousGovernanceTokens)[keyof typeof AutonomousGovernanceTokens];
