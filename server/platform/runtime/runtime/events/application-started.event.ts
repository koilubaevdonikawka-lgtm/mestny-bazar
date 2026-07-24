export const ApplicationStartedEventName = "platform.runtime.application.started";

export interface ApplicationStartedEvent {
  readonly name: typeof ApplicationStartedEventName;
  readonly occurredAt: string;
  readonly pid: number;
}

export function createApplicationStartedEvent(): ApplicationStartedEvent {
  return Object.freeze({
    name: ApplicationStartedEventName,
    occurredAt: new Date().toISOString(),
    pid: typeof process !== "undefined" ? process.pid : 0,
  });
}
