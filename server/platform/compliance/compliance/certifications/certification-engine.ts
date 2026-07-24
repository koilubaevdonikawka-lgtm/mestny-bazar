import type { ICertificationEngine } from "@server/platform/compliance/compliance/contracts";
import {
  createComplianceCertificate,
  type CertificationStatus,
  type ComplianceAssessment,
  type ComplianceCertificate,
} from "@server/platform/compliance/compliance/models";
import { createCertificateIssuedEvent } from "@server/platform/compliance/compliance/events";

/** Issues certification metadata without changing system state. */
export class CertificationEngine implements ICertificationEngine {
  certify(assessment: ComplianceAssessment): ComplianceCertificate {
    const status = this.resolveStatus(assessment.score, assessment.passed);
    const certificate = createComplianceCertificate({
      standardId: assessment.standardId,
      status,
      score: assessment.score,
      expiresAt:
        status === "passed"
          ? new Date(Date.now() + 86_400_000 * 90).toISOString()
          : undefined,
      metadata: Object.freeze({ reason: assessment.reason }),
    });
    createCertificateIssuedEvent(certificate);
    return certificate;
  }

  resolveStatus(score: number, passed: boolean): CertificationStatus {
    if (!passed && score === 0) {
      return "failed";
    }
    if (!passed && score > 0) {
      return "conditional";
    }
    if (passed && score >= 100) {
      return "passed";
    }
    if (passed && score >= 70) {
      return "conditional";
    }
    if (score === 0) {
      return "draft";
    }
    return "expired";
  }
}
