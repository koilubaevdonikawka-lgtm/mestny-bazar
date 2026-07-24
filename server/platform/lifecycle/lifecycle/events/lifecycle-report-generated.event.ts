import type { LifecycleReport } from "@server/platform/lifecycle/lifecycle/models";

export interface LifecycleReportGeneratedEvent {
  readonly type: "lifecycle.report.generated";
  readonly report: LifecycleReport;
}

export function createLifecycleReportGeneratedEvent(
  report: LifecycleReport,
): LifecycleReportGeneratedEvent {
  return Object.freeze({ type: "lifecycle.report.generated", report });
}
