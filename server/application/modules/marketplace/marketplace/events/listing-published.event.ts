import type { MarketplaceListing } from "@server/application/modules/marketplace/marketplace/models";

export interface ListingPublishedEvent {
  readonly type: "marketplace.listing.published";
  readonly listing: MarketplaceListing;
  readonly occurredAt: string;
}

export function createListingPublishedEvent(
  listing: MarketplaceListing,
): ListingPublishedEvent {
  return Object.freeze({
    type: "marketplace.listing.published",
    listing,
    occurredAt: new Date().toISOString(),
  });
}
