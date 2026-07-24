export {
  PolicyRegisteredEventName,
  type PolicyRegisteredEvent,
  createPolicyRegisteredEvent,
} from "./policy-registered.event";
export {
  PolicyEvaluatedEventName,
  type PolicyEvaluatedEvent,
  createPolicyEvaluatedEvent,
} from "./policy-evaluated.event";
export {
  PolicyViolationDetectedEventName,
  type PolicyViolationDetectedEvent,
  createPolicyViolationDetectedEvent,
} from "./policy-violation-detected.event";
export {
  GovernanceReportGeneratedEventName,
  type GovernanceReportGeneratedEvent,
  createGovernanceReportGeneratedEvent,
} from "./governance-report-generated.event";

export type GovernancePlatformEvent =
  | PolicyRegisteredEvent
  | PolicyEvaluatedEvent
  | PolicyViolationDetectedEvent
  | GovernanceReportGeneratedEvent;
