export const ApplicationStoppedEventName = "platform.runtime.application.stopped";

export interface ApplicationStoppedEvent {
  readonly name: typeof ApplicationStoppedEventName;
  readonly occurredAt: string;
  readonly reason?: string;
}

export function createApplicationStoppedEvent(input?: {
  reason?: string;
}): ApplicationStoppedEvent {
  return Object.freeze({
    name: ApplicationStoppedEventName,
    occurredAt: new Date().toISOString(),
    reason: input?.reason?.trim() || undefined,
  });
}
