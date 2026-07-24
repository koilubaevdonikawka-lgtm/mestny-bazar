import type { ArchitectureScore } from "@server/platform/architecture-intelligence/architecture-intelligence/models";

/** Contract for architecture scoring. */
export interface IArchitectureScoringEngine {
  calculate(analysis?: import("../models").ArchitectureAnalysis): ArchitectureScore;
}
