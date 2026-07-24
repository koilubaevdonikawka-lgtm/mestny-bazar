import type { MarketplaceService } from "@server/application/modules/marketplace/marketplace/services";
import type {
  ApproveListingDto,
  PublishListingDto,
  RejectListingDto,
  UnpublishListingDto,
} from "@server/application/modules/marketplace/marketplace/dto";
import type { MarketplaceListing } from "@server/application/modules/marketplace/marketplace/models";
import { AnalyticsCapabilityEventName } from "@server/application/modules/analytics/analytics/services/analytics-capability-event-names";
import type { CapabilityEventPublisher } from "@server/infrastructure/analytics/capability-event-publisher";

/** Publishes marketplace capability events without modifying MarketplaceService business logic. */
export class EventPublishingMarketplaceService
  implements
    Pick<
      MarketplaceService,
      | "publishListing"
      | "approveListing"
      | "rejectListing"
      | "unpublishListing"
      | "getListing"
      | "isPublished"
    >
{
  constructor(
    private readonly inner: MarketplaceService,
    private readonly publisher: CapabilityEventPublisher,
  ) {}

  publishListing(dto: PublishListingDto): Promise<MarketplaceListing> {
    return this.inner.publishListing(dto);
  }

  approveListing(dto: ApproveListingDto): Promise<MarketplaceListing> {
    return this.inner.approveListing(dto).then(async (listing) => {
      await this.publisher.publish({
        eventName: AnalyticsCapabilityEventName.ListingPublished,
        aggregateId: listing.productId,
        aggregateType: "MarketplaceListing",
        payload: {
          productId: listing.productId,
          sellerId: listing.sellerId,
          listingStatus: listing.listingStatus,
        },
      });
      return listing;
    });
  }

  rejectListing(dto: RejectListingDto): Promise<MarketplaceListing> {
    return this.inner.rejectListing(dto);
  }

  unpublishListing(dto: UnpublishListingDto): Promise<MarketplaceListing> {
    return this.inner.unpublishListing(dto).then(async (listing) => {
      await this.publisher.publish({
        eventName: AnalyticsCapabilityEventName.ListingUnpublished,
        aggregateId: listing.productId,
        aggregateType: "MarketplaceListing",
        payload: {
          productId: listing.productId,
          sellerId: listing.sellerId,
          listingStatus: listing.listingStatus,
        },
      });
      return listing;
    });
  }

  getListing(productId: string): Promise<MarketplaceListing | null> {
    return this.inner.getListing(productId);
  }

  isPublished(productId: string): Promise<boolean> {
    return this.inner.isPublished(productId);
  }
}

export function asMarketplaceService(
  wrapper: EventPublishingMarketplaceService,
): MarketplaceService {
  return wrapper as unknown as MarketplaceService;
}
