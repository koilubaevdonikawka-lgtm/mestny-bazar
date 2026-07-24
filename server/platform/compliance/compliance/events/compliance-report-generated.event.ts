import type { ComplianceReport } from "@server/platform/compliance/compliance/models";

export interface ComplianceReportGeneratedEvent {
  readonly type: "compliance.report.generated";
  readonly report: ComplianceReport;
}

export function createComplianceReportGeneratedEvent(
  report: ComplianceReport,
): ComplianceReportGeneratedEvent {
  return Object.freeze({ type: "compliance.report.generated", report });
}
