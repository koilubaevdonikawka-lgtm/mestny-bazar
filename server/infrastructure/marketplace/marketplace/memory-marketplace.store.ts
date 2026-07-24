import type { IMarketplaceStore } from "@server/application/modules/marketplace/marketplace/contracts";
import type { MarketplaceListing } from "@server/application/modules/marketplace/marketplace/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory marketplace listing store for development and tests. */
export class MemoryMarketplaceStore implements IMarketplaceStore {
  private readonly listings = new InMemoryStore<MarketplaceListing>((listing) => listing.id);
  private readonly listingsByProductId = new Map<string, string>();

  async saveListing(listing: MarketplaceListing): Promise<void> {
    this.listings.set(listing);
    this.listingsByProductId.set(listing.productId, listing.id);
  }

  async updateListing(listing: MarketplaceListing): Promise<void> {
    if (!this.listings.has(listing.id)) {
      throw new Error(`Marketplace listing not found: ${listing.id}`);
    }
    this.listings.set(listing);
    this.listingsByProductId.set(listing.productId, listing.id);
  }

  async findListingById(listingId: string): Promise<MarketplaceListing | null> {
    return this.listings.get(listingId.trim()) ?? null;
  }

  async findListingByProductId(productId: string): Promise<MarketplaceListing | null> {
    const listingId = this.listingsByProductId.get(productId.trim());
    if (!listingId) {
      return null;
    }
    return this.listings.get(listingId) ?? null;
  }
}
