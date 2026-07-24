import type { ArchitectureAnalysis } from "@server/platform/architecture-intelligence/architecture-intelligence/models";

export interface ArchitectureAnalyzedEvent {
  readonly type: "architecture-intelligence.analyzed";
  readonly analysis: ArchitectureAnalysis;
}

export function createArchitectureAnalyzedEvent(
  analysis: ArchitectureAnalysis,
): ArchitectureAnalyzedEvent {
  return Object.freeze({ type: "architecture-intelligence.analyzed", analysis });
}
