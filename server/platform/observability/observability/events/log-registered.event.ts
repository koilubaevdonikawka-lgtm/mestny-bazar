import type { LogEntry } from "@server/platform/observability/observability/models";

export interface LogRegisteredEvent {
  readonly type: "observability.log.registered";
  readonly entry: LogEntry;
}

export function createLogRegisteredEvent(entry: LogEntry): LogRegisteredEvent {
  return Object.freeze({ type: "observability.log.registered", entry });
}
