import type { ProviderHealth } from "@server/platform/integration/integration/models";

export const ProviderHealthChangedEventName = "platform.integration.provider.health.changed";

export interface ProviderHealthChangedEvent {
  readonly name: typeof ProviderHealthChangedEventName;
  readonly occurredAt: string;
  readonly health: ProviderHealth;
}

export function createProviderHealthChangedEvent(
  health: ProviderHealth,
): ProviderHealthChangedEvent {
  return Object.freeze({
    name: ProviderHealthChangedEventName,
    occurredAt: new Date().toISOString(),
    health,
  });
}
