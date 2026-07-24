import type { ArchitectureRisk } from "@server/platform/architecture-intelligence/architecture-intelligence/models";

/** Contract for architecture risk detection (metadata only). */
export interface IArchitectureRiskEngine {
  detect(): readonly ArchitectureRisk[];
}
