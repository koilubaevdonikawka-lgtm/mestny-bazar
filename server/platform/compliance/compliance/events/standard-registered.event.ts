import type { ComplianceStandard } from "@server/platform/compliance/compliance/models";

export interface StandardRegisteredEvent {
  readonly type: "compliance.standard.registered";
  readonly standard: ComplianceStandard;
}

export function createStandardRegisteredEvent(standard: ComplianceStandard): StandardRegisteredEvent {
  return Object.freeze({ type: "compliance.standard.registered", standard });
}
