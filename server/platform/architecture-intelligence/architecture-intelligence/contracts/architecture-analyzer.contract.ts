import type { ArchitectureAnalysis } from "@server/platform/architecture-intelligence/architecture-intelligence/models";

/** Contract for metadata architecture analysis. */
export interface IArchitectureAnalyzer {
  analyze(): ArchitectureAnalysis;
}
