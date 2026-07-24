export {
  type ComponentRegisteredEvent,
  createComponentRegisteredEvent,
} from "./component-registered.event";
export {
  type LifecycleStartedEvent,
  createLifecycleStartedEvent,
} from "./lifecycle-started.event";
export {
  type LifecycleStateChangedEvent,
  createLifecycleStateChangedEvent,
} from "./lifecycle-state-changed.event";
export {
  type RecoveryPlannedEvent,
  createRecoveryPlannedEvent,
} from "./recovery-planned.event";
export {
  type LifecycleReportGeneratedEvent,
  createLifecycleReportGeneratedEvent,
} from "./lifecycle-report-generated.event";

export type LifecyclePlatformEvent =
  | ComponentRegisteredEvent
  | LifecycleStartedEvent
  | LifecycleStateChangedEvent
  | RecoveryPlannedEvent
  | LifecycleReportGeneratedEvent;
