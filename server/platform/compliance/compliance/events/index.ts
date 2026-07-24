export {
  type StandardRegisteredEvent,
  createStandardRegisteredEvent,
} from "./standard-registered.event";
export {
  type AssessmentCompletedEvent,
  createAssessmentCompletedEvent,
} from "./assessment-completed.event";
export {
  type CertificateIssuedEvent,
  createCertificateIssuedEvent,
} from "./certificate-issued.event";
export {
  type ComplianceReportGeneratedEvent,
  createComplianceReportGeneratedEvent,
} from "./compliance-report-generated.event";
export {
  type ComplianceScoreCalculatedEvent,
  createComplianceScoreCalculatedEvent,
} from "./compliance-score-calculated.event";

export type CompliancePlatformEvent =
  | StandardRegisteredEvent
  | AssessmentCompletedEvent
  | CertificateIssuedEvent
  | ComplianceReportGeneratedEvent
  | ComplianceScoreCalculatedEvent;
