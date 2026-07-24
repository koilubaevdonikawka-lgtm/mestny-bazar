import type {
  ComplianceAssessment,
  ComplianceScore,
  ComplianceStandard,
} from "@server/platform/compliance/compliance/models";

/** Contract for compliance scoring (metadata only). */
export interface IComplianceScoringEngine {
  calculate(
    standards: readonly ComplianceStandard[],
    assessments: readonly ComplianceAssessment[],
  ): ComplianceScore;
  readinessScore(score: ComplianceScore): number;
}
