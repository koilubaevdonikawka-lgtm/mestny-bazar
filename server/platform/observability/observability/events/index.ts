import type { MetricRecordedEvent } from "./metric-recorded.event";
import type { TraceStartedEvent, TraceCompletedEvent } from "./trace-events";
import type { LogRegisteredEvent } from "./log-registered.event";
import type { CorrelationCreatedEvent } from "./correlation-created.event";

export {
  type MetricRecordedEvent,
  createMetricRecordedEvent,
} from "./metric-recorded.event";
export {
  type TraceStartedEvent,
  type TraceCompletedEvent,
  createTraceStartedEvent,
  createTraceCompletedEvent,
} from "./trace-events";
export {
  type LogRegisteredEvent,
  createLogRegisteredEvent,
} from "./log-registered.event";
export {
  type CorrelationCreatedEvent,
  createCorrelationCreatedEvent,
} from "./correlation-created.event";

export type ObservabilityPlatformEvent =
  | MetricRecordedEvent
  | TraceStartedEvent
  | TraceCompletedEvent
  | LogRegisteredEvent
  | CorrelationCreatedEvent;
