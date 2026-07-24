import type { GovernancePlan } from "./governance-plan.model";
import type { GovernanceRecommendation } from "./governance-recommendation.model";
import type { GovernanceSession } from "./governance-session.model";
import type { PlatformHealthReport } from "./platform-health-report.model";

/** Complete governance evaluation summary. */
export interface GovernanceSummary {
  readonly id: string;
  readonly session: GovernanceSession;
  readonly health: PlatformHealthReport;
  readonly plans: readonly GovernancePlan[];
  readonly recommendations: readonly GovernanceRecommendation[];
  readonly generatedAt: string;
}

export function createGovernanceSummary(input: {
  id?: string;
  session: GovernanceSession;
  health: PlatformHealthReport;
  plans?: readonly GovernancePlan[];
  recommendations?: readonly GovernanceRecommendation[];
}): GovernanceSummary {
  return Object.freeze({
    id: input.id ?? `summary-${Date.now()}`,
    session: input.session,
    health: input.health,
    plans: Object.freeze([...(input.plans ?? [])]),
    recommendations: Object.freeze([...(input.recommendations ?? [])]),
    generatedAt: new Date().toISOString(),
  });
}

export type PlatformSystemEntry = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly registeredAt: string;
};

export function createPlatformSystemEntry(input: {
  id: string;
  name: string;
  status?: string;
}): PlatformSystemEntry {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    status: input.status?.trim() ?? "active",
    registeredAt: new Date().toISOString(),
  });
}
