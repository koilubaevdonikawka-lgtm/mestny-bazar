import type {
  ComplianceAssessment,
  ComplianceStandard,
} from "@server/platform/compliance/compliance/models";

/** Contract for compliance metadata validation. */
export interface IComplianceValidator {
  validate(standard: ComplianceStandard): ComplianceAssessment;
  validateAll(standards: readonly ComplianceStandard[]): readonly ComplianceAssessment[];
}
