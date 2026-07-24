import type { PolicyReport } from "@server/platform/policy/policy/models";

export interface PolicyReportGeneratedEvent {
  readonly type: "policy.report.generated";
  readonly report: PolicyReport;
}

export function createPolicyReportGeneratedEvent(report: PolicyReport): PolicyReportGeneratedEvent {
  return Object.freeze({ type: "policy.report.generated", report });
}
