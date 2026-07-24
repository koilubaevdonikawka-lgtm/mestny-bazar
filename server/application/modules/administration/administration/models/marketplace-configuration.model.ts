export const MARKETPLACE_CONFIGURATION_ID = "marketplace";

/** Marketplace operational configuration owned by Administration. */
export interface MarketplaceConfiguration {
  readonly id: typeof MARKETPLACE_CONFIGURATION_ID;
  readonly maxListingCount: number;
  readonly autoApproveSellers: boolean;
  readonly commissionRate: number;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export function createDefaultMarketplaceConfiguration(updatedBy = "system"): MarketplaceConfiguration {
  const timestamp = new Date().toISOString();
  return Object.freeze({
    id: MARKETPLACE_CONFIGURATION_ID,
    maxListingCount: 10_000,
    autoApproveSellers: false,
    commissionRate: 0.1,
    updatedAt: timestamp,
    updatedBy,
  });
}

export function withMarketplaceConfigurationUpdate(
  configuration: MarketplaceConfiguration,
  input: {
    maxListingCount?: number;
    autoApproveSellers?: boolean;
    commissionRate?: number;
    updatedBy: string;
  },
): MarketplaceConfiguration {
  return Object.freeze({
    ...configuration,
    maxListingCount:
      input.maxListingCount === undefined
        ? configuration.maxListingCount
        : Math.max(0, input.maxListingCount),
    autoApproveSellers: input.autoApproveSellers ?? configuration.autoApproveSellers,
    commissionRate:
      input.commissionRate === undefined
        ? configuration.commissionRate
        : clampRate(input.commissionRate),
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy.trim(),
  });
}

function clampRate(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}
