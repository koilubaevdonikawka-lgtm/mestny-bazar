import type { ProviderDescriptor } from "@server/platform/integration/integration/models";

export const ProviderRegisteredEventName = "platform.integration.provider.registered";

export interface ProviderRegisteredEvent {
  readonly name: typeof ProviderRegisteredEventName;
  readonly occurredAt: string;
  readonly provider: ProviderDescriptor;
}

export function createProviderRegisteredEvent(
  provider: ProviderDescriptor,
): ProviderRegisteredEvent {
  return Object.freeze({
    name: ProviderRegisteredEventName,
    occurredAt: new Date().toISOString(),
    provider,
  });
}
