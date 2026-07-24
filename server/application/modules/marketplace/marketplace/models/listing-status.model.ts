/** Marketplace listing lifecycle statuses. */
export const ListingStatus = {
  Draft: "draft",
  PendingModeration: "pending_moderation",
  Published: "published",
  Unpublished: "unpublished",
} as const;

export type ListingStatusValue = (typeof ListingStatus)[keyof typeof ListingStatus];

export const LISTING_STATUS_VALUES: readonly ListingStatusValue[] = Object.values(ListingStatus);

export function isListingStatus(value: string): value is ListingStatusValue {
  return LISTING_STATUS_VALUES.includes(value as ListingStatusValue);
}

export function isPublishedListingStatus(status: ListingStatusValue): boolean {
  return status === ListingStatus.Published;
}
