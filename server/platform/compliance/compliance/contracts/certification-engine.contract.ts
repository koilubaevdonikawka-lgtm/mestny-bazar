import type {
  CertificationStatus,
  ComplianceAssessment,
  ComplianceCertificate,
} from "@server/platform/compliance/compliance/models";

/** Contract for certification metadata (no system state changes). */
export interface ICertificationEngine {
  certify(assessment: ComplianceAssessment): ComplianceCertificate;
  resolveStatus(score: number, passed: boolean): CertificationStatus;
}
