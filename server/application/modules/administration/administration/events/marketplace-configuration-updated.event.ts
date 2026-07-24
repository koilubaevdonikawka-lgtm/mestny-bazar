import type { MarketplaceConfiguration } from "@server/application/modules/administration/administration/models";

export interface MarketplaceConfigurationUpdatedEvent {
  readonly type: "administration.marketplace_configuration.updated";
  readonly configuration: MarketplaceConfiguration;
  readonly occurredAt: string;
}

export function createMarketplaceConfigurationUpdatedEvent(
  configuration: MarketplaceConfiguration,
): MarketplaceConfigurationUpdatedEvent {
  return Object.freeze({
    type: "administration.marketplace_configuration.updated",
    configuration,
    occurredAt: new Date().toISOString(),
  });
}
