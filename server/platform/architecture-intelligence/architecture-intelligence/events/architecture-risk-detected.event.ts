import type { ArchitectureRisk } from "@server/platform/architecture-intelligence/architecture-intelligence/models";

export interface ArchitectureRiskDetectedEvent {
  readonly type: "architecture-intelligence.risk.detected";
  readonly risks: readonly ArchitectureRisk[];
}

export function createArchitectureRiskDetectedEvent(
  risks: readonly ArchitectureRisk[],
): ArchitectureRiskDetectedEvent {
  return Object.freeze({ type: "architecture-intelligence.risk.detected", risks });
}
