export const ProviderUnavailableEventName = "platform.integration.provider.unavailable";

export interface ProviderUnavailableEvent {
  readonly name: typeof ProviderUnavailableEventName;
  readonly occurredAt: string;
  readonly providerId: string;
  readonly reason?: string;
}

export function createProviderUnavailableEvent(input: {
  providerId: string;
  reason?: string;
}): ProviderUnavailableEvent {
  return Object.freeze({
    name: ProviderUnavailableEventName,
    occurredAt: new Date().toISOString(),
    providerId: input.providerId.trim(),
    reason: input.reason?.trim() || undefined,
  });
}
