export const ProviderHealthChangedEventName = "platform.runtime.provider.health.changed";

export interface ProviderHealthChangedEvent {
  readonly name: typeof ProviderHealthChangedEventName;
  readonly occurredAt: string;
  readonly providerId: string;
  readonly status: "healthy" | "degraded" | "unavailable";
  readonly message?: string;
}

export function createProviderHealthChangedEvent(input: {
  providerId: string;
  status: ProviderHealthChangedEvent["status"];
  message?: string;
}): ProviderHealthChangedEvent {
  return Object.freeze({
    name: ProviderHealthChangedEventName,
    occurredAt: new Date().toISOString(),
    providerId: input.providerId.trim(),
    status: input.status,
    message: input.message?.trim() || undefined,
  });
}
