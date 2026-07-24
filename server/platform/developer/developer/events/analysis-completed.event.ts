import type { AnalysisReport } from "@server/platform/developer/developer/models";

/** Emitted when architecture analysis completes. */
export interface AnalysisCompletedEvent {
  readonly type: "developer.analysis.completed";
  readonly report: AnalysisReport;
}

export function createAnalysisCompletedEvent(report: AnalysisReport): AnalysisCompletedEvent {
  return Object.freeze({ type: "developer.analysis.completed", report });
}
