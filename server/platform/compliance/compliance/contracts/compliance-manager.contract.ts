import type {
  ComplianceAssessment,
  ComplianceCertificate,
  ComplianceReport,
  ComplianceStandard,
  ComplianceScore,
} from "@server/platform/compliance/compliance/models";

/** Contract for compliance lifecycle orchestration. */
export interface IComplianceManager {
  registerStandard(standard: ComplianceStandard): ComplianceStandard;
  runAssessment(standardId: string): ComplianceAssessment;
  generateReport(kind?: ComplianceReport["kind"]): ComplianceReport;
  issueCertificate(standardId: string): ComplianceCertificate;
  listStandards(category?: ComplianceStandard["category"]): readonly ComplianceStandard[];
}

export type { ComplianceScore };
