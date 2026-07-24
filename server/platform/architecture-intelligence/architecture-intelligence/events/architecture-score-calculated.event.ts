import type { ArchitectureScore } from "@server/platform/architecture-intelligence/architecture-intelligence/models";

export interface ArchitectureScoreCalculatedEvent {
  readonly type: "architecture-intelligence.score.calculated";
  readonly score: ArchitectureScore;
}

export function createArchitectureScoreCalculatedEvent(
  score: ArchitectureScore,
): ArchitectureScoreCalculatedEvent {
  return Object.freeze({ type: "architecture-intelligence.score.calculated", score });
}
