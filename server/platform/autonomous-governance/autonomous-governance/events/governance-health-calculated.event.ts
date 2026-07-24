import type { PlatformHealthReport } from "@server/platform/autonomous-governance/autonomous-governance/models";

export interface GovernanceHealthCalculatedEvent {
  readonly type: "autonomous-governance.health.calculated";
  readonly report: PlatformHealthReport;
}

export function createGovernanceHealthCalculatedEvent(
  report: PlatformHealthReport,
): GovernanceHealthCalculatedEvent {
  return Object.freeze({ type: "autonomous-governance.health.calculated", report });
}
