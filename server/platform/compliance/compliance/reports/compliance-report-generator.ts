import type { IComplianceReportGenerator } from "@server/platform/compliance/compliance/contracts";
import {
  createComplianceReport,
  createComplianceScore,
  type ComplianceAssessment,
  type ComplianceReport,
  type ComplianceReportKind,
  type ComplianceScore,
} from "@server/platform/compliance/compliance/models";
import { createComplianceReportGeneratedEvent } from "@server/platform/compliance/compliance/events";

/** Generates compliance reports from assessment metadata. */
export class ComplianceReportGenerator implements IComplianceReportGenerator {
  generateAssessmentReport(assessments: readonly ComplianceAssessment[]): ComplianceReport {
    return this.storeReport(
      createComplianceReport({
        kind: "assessment",
        assessments,
        summary: "Compliance assessment report",
      }),
    );
  }

  generateCertificationReport(assessments: readonly ComplianceAssessment[]): ComplianceReport {
    return this.storeReport(
      createComplianceReport({
        kind: "certification",
        assessments,
        summary: "Certification readiness report",
      }),
    );
  }

  generateReadinessReport(
    assessments: readonly ComplianceAssessment[],
    score: ComplianceScore,
  ): ComplianceReport {
    return this.storeReport(
      createComplianceReport({
        kind: "readiness",
        assessments,
        summary: `Readiness score: ${score.readinessScore}`,
      }),
    );
  }

  generateGapAnalysis(assessments: readonly ComplianceAssessment[]): ComplianceReport {
    const failed = assessments.filter((assessment) => !assessment.passed);
    return this.storeReport(
      createComplianceReport({
        kind: "gap-analysis",
        assessments: failed,
        summary: `${failed.length} compliance gaps identified`,
      }),
    );
  }

  generate(
    kind: ComplianceReportKind,
    assessments: readonly ComplianceAssessment[],
    score?: ComplianceScore,
  ): ComplianceReport {
    switch (kind) {
      case "assessment":
        return this.generateAssessmentReport(assessments);
      case "certification":
        return this.generateCertificationReport(assessments);
      case "readiness":
        return this.generateReadinessReport(
          assessments,
          score ??
            createComplianceScore({
              categoryScore: 0,
              overallScore: 0,
              weightedScore: 0,
              readinessScore: 0,
            }),
        );
      case "gap-analysis":
        return this.generateGapAnalysis(assessments);
      default:
        return this.generateAssessmentReport(assessments);
    }
  }

  private storeReport(report: ComplianceReport): ComplianceReport {
    createComplianceReportGeneratedEvent(report);
    return report;
  }
}
