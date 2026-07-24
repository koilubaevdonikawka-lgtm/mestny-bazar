import type { ComplianceAssessment } from "@server/platform/compliance/compliance/models";

export interface AssessmentCompletedEvent {
  readonly type: "compliance.assessment.completed";
  readonly assessment: ComplianceAssessment;
}

export function createAssessmentCompletedEvent(
  assessment: ComplianceAssessment,
): AssessmentCompletedEvent {
  return Object.freeze({ type: "compliance.assessment.completed", assessment });
}
