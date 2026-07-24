import type { MarketplaceListing } from "@server/application/modules/marketplace/marketplace/models";

/** Marketplace listing persistence contract — implemented by infrastructure adapters. */
export interface IMarketplaceStore {
  saveListing(listing: MarketplaceListing): Promise<void>;
  updateListing(listing: MarketplaceListing): Promise<void>;
  findListingById(listingId: string): Promise<MarketplaceListing | null>;
  findListingByProductId(productId: string): Promise<MarketplaceListing | null>;
}
