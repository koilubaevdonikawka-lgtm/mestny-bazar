import type { ComplianceScore } from "@server/platform/compliance/compliance/models";

export interface ComplianceScoreCalculatedEvent {
  readonly type: "compliance.score.calculated";
  readonly score: ComplianceScore;
}

export function createComplianceScoreCalculatedEvent(
  score: ComplianceScore,
): ComplianceScoreCalculatedEvent {
  return Object.freeze({ type: "compliance.score.calculated", score });
}
