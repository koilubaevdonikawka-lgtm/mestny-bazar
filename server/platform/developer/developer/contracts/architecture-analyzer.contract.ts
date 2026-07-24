import type { AnalysisReport } from "@server/platform/developer/developer/models";

/** Contract for architecture analysis. */
export interface IArchitectureAnalyzer {
  analyze(): Promise<AnalysisReport> | AnalysisReport;
}
