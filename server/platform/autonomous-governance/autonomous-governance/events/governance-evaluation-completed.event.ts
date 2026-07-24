import type { PlatformMonitoringSnapshot } from "@server/platform/autonomous-governance/autonomous-governance/models";

export interface GovernanceEvaluationCompletedEvent {
  readonly type: "autonomous-governance.evaluation.completed";
  readonly snapshot: PlatformMonitoringSnapshot;
}

export function createGovernanceEvaluationCompletedEvent(
  snapshot: PlatformMonitoringSnapshot,
): GovernanceEvaluationCompletedEvent {
  return Object.freeze({ type: "autonomous-governance.evaluation.completed", snapshot });
}
