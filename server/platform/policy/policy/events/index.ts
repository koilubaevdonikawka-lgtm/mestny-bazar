export {
  type PolicyRegisteredEvent,
  createPolicyRegisteredEvent,
} from "./policy-registered.event";
export {
  type PolicyEvaluatedEvent,
  createPolicyEvaluatedEvent,
} from "./policy-evaluated.event";
export {
  type PolicyEnforcedEvent,
  createPolicyEnforcedEvent,
} from "./policy-enforced.event";
export {
  type PolicyExceptionRegisteredEvent,
  createPolicyExceptionRegisteredEvent,
} from "./policy-exception-registered.event";
export {
  type PolicyReportGeneratedEvent,
  createPolicyReportGeneratedEvent,
} from "./policy-report-generated.event";

export type PolicyPlatformEvent =
  | PolicyRegisteredEvent
  | PolicyEvaluatedEvent
  | PolicyEnforcedEvent
  | PolicyExceptionRegisteredEvent
  | PolicyReportGeneratedEvent;
