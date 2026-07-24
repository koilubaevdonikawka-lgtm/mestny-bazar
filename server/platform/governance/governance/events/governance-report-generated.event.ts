export const GovernanceReportGeneratedEventName = "platform.governance.report.generated";

export interface GovernanceReportGeneratedEvent {
  readonly name: typeof GovernanceReportGeneratedEventName;
  readonly occurredAt: string;
  readonly reportId: string;
  readonly failed: number;
}

export function createGovernanceReportGeneratedEvent(input: {
  reportId: string;
  failed: number;
}): GovernanceReportGeneratedEvent {
  return Object.freeze({
    name: GovernanceReportGeneratedEventName,
    occurredAt: new Date().toISOString(),
    reportId: input.reportId.trim(),
    failed: input.failed,
  });
}
