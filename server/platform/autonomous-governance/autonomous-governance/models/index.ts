export {
  type GovernanceSession,
  createGovernanceSession,
} from "./governance-session.model";
export {
  type GovernancePlanKind,
  type GovernancePlan,
  createGovernancePlan,
} from "./governance-plan.model";
export {
  type PlatformHealthReport,
  createPlatformHealthReport,
} from "./platform-health-report.model";
export {
  type GovernanceRecommendationKind,
  type GovernanceRecommendation,
  createGovernanceRecommendation,
} from "./governance-recommendation.model";
export {
  type GovernanceSummary,
  type PlatformSystemEntry,
  createGovernanceSummary,
  createPlatformSystemEntry,
} from "./governance-summary.model";

export type PlatformMonitoringSnapshot = {
  readonly platformStatus: string;
  readonly architectureStatus: string;
  readonly capabilityStatus: string;
  readonly knowledgeStatus: string;
  readonly complianceStatus: string;
  readonly decisionStatus: string;
  readonly capturedAt: string;
};

export function createPlatformMonitoringSnapshot(input: {
  platformStatus: string;
  architectureStatus: string;
  capabilityStatus: string;
  knowledgeStatus: string;
  complianceStatus: string;
  decisionStatus: string;
}): PlatformMonitoringSnapshot {
  return Object.freeze({
    ...input,
    capturedAt: new Date().toISOString(),
  });
}

export type PlatformCoordinationResult = {
  readonly id: string;
  readonly coordinatedPlatforms: readonly string[];
  readonly coordinatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
};

export function createPlatformCoordinationResult(input: {
  id?: string;
  coordinatedPlatforms: readonly string[];
  metadata?: Readonly<Record<string, unknown>>;
}): PlatformCoordinationResult {
  return Object.freeze({
    id: input.id ?? `coordination-${Date.now()}`,
    coordinatedPlatforms: Object.freeze([...input.coordinatedPlatforms]),
    coordinatedAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
