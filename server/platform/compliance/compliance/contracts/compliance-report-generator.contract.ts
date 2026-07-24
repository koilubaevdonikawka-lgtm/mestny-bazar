import type {
  ComplianceAssessment,
  ComplianceReport,
  ComplianceReportKind,
  ComplianceScore,
} from "@server/platform/compliance/compliance/models";

/** Contract for compliance report generation. */
export interface IComplianceReportGenerator {
  generateAssessmentReport(assessments: readonly ComplianceAssessment[]): ComplianceReport;
  generateCertificationReport(assessments: readonly ComplianceAssessment[]): ComplianceReport;
  generateReadinessReport(
    assessments: readonly ComplianceAssessment[],
    score: ComplianceScore,
  ): ComplianceReport;
  generateGapAnalysis(assessments: readonly ComplianceAssessment[]): ComplianceReport;
  generate(kind: ComplianceReportKind, assessments: readonly ComplianceAssessment[], score?: ComplianceScore): ComplianceReport;
}
