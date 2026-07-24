import {
  ListingStatus,
  type ListingStatusValue,
} from "@server/application/modules/marketplace/marketplace/models/listing-status.model";
import {
  MarketplaceVisibility,
  type MarketplaceVisibilityValue,
} from "@server/application/modules/marketplace/marketplace/models/marketplace-visibility.model";

/** Marketplace listing owned by the Marketplace capability module. */
export interface MarketplaceListing {
  readonly id: string;
  readonly productId: string;
  readonly sellerId: string;
  readonly categoryId: string | null;
  readonly listingStatus: ListingStatusValue;
  readonly visibility: MarketplaceVisibilityValue;
  readonly publishedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createMarketplaceListing(input: {
  id: string;
  productId: string;
  sellerId: string;
  categoryId?: string | null;
}): MarketplaceListing {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    productId: input.productId.trim(),
    sellerId: input.sellerId.trim(),
    categoryId: input.categoryId?.trim() || null,
    listingStatus: ListingStatus.PendingModeration,
    visibility: MarketplaceVisibility.Hidden,
    publishedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withListingStatus(
  listing: MarketplaceListing,
  listingStatus: ListingStatusValue,
): MarketplaceListing {
  return Object.freeze({
    ...listing,
    listingStatus,
    updatedAt: new Date().toISOString(),
  });
}

export function withListingVisibility(
  listing: MarketplaceListing,
  visibility: MarketplaceVisibilityValue,
): MarketplaceListing {
  return Object.freeze({
    ...listing,
    visibility,
    updatedAt: new Date().toISOString(),
  });
}

export function withListingPublished(listing: MarketplaceListing): MarketplaceListing {
  const timestamp = new Date().toISOString();
  return Object.freeze({
    ...listing,
    listingStatus: ListingStatus.Published,
    visibility: MarketplaceVisibility.Public,
    publishedAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withListingUnpublished(listing: MarketplaceListing): MarketplaceListing {
  return Object.freeze({
    ...listing,
    listingStatus: ListingStatus.Unpublished,
    visibility: MarketplaceVisibility.Hidden,
    publishedAt: null,
    updatedAt: new Date().toISOString(),
  });
}

export function isListingPublished(listing: MarketplaceListing): boolean {
  return (
    listing.listingStatus === ListingStatus.Published &&
    listing.visibility === MarketplaceVisibility.Public
  );
}

export function canListingEnterModeration(listing: MarketplaceListing): boolean {
  return listing.listingStatus === ListingStatus.PendingModeration;
}

export function canListingBePublished(listing: MarketplaceListing): boolean {
  return listing.listingStatus === ListingStatus.PendingModeration;
}

export function canListingBeUnpublished(listing: MarketplaceListing): boolean {
  return listing.listingStatus === ListingStatus.Published;
}
