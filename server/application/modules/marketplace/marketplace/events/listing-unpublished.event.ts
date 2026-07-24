import type { MarketplaceListing } from "@server/application/modules/marketplace/marketplace/models";

export interface ListingUnpublishedEvent {
  readonly type: "marketplace.listing.unpublished";
  readonly listing: MarketplaceListing;
  readonly occurredAt: string;
}

export function createListingUnpublishedEvent(
  listing: MarketplaceListing,
): ListingUnpublishedEvent {
  return Object.freeze({
    type: "marketplace.listing.unpublished",
    listing,
    occurredAt: new Date().toISOString(),
  });
}
