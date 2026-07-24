/** Marketplace listing visibility states. */
export const MarketplaceVisibility = {
  Public: "public",
  Hidden: "hidden",
} as const;

export type MarketplaceVisibilityValue =
  (typeof MarketplaceVisibility)[keyof typeof MarketplaceVisibility];

export const MARKETPLACE_VISIBILITY_VALUES: readonly MarketplaceVisibilityValue[] =
  Object.values(MarketplaceVisibility);

export function isMarketplaceVisibility(value: string): value is MarketplaceVisibilityValue {
  return MARKETPLACE_VISIBILITY_VALUES.includes(value as MarketplaceVisibilityValue);
}

export function isPublicMarketplaceVisibility(visibility: MarketplaceVisibilityValue): boolean {
  return visibility === MarketplaceVisibility.Public;
}
