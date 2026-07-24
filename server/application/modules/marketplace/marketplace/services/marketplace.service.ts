import type { ModerationModule } from "@server/application/modules/moderation/moderation/api/moderation.module";
import {
  ModerationStatus,
  ModerationTarget,
} from "@server/application/modules/moderation/moderation/models";
import type { IMarketplaceStore } from "@server/application/modules/marketplace/marketplace/contracts";
import type {
  ApproveListingDto,
  PublishListingDto,
  RejectListingDto,
  UnpublishListingDto,
} from "@server/application/modules/marketplace/marketplace/dto";
import {
  createListingPublishedEvent,
  createListingUnpublishedEvent,
} from "@server/application/modules/marketplace/marketplace/events";
import {
  canListingBePublished,
  canListingBeUnpublished,
  createMarketplaceListing,
  isListingPublished,
  ListingStatus,
  withListingPublished,
  withListingStatus,
  withListingUnpublished,
  type MarketplaceListing,
} from "@server/application/modules/marketplace/marketplace/models";
import { MarketplacePublicationPolicy } from "@server/application/modules/marketplace/marketplace/policies/marketplace-publication.policy";
import type { IIdGenerator } from "@server/application/ports";

/** Marketplace business capability service — orchestrates listings via IMarketplaceStore. */
export class MarketplaceService {
  constructor(
    private readonly store: IMarketplaceStore,
    private readonly idGenerator: IIdGenerator,
    private readonly publicationPolicy: MarketplacePublicationPolicy,
    private readonly moderation: ModerationModule,
  ) {}

  async publishListing(dto: PublishListingDto): Promise<MarketplaceListing> {
    validatePublishListingDto(dto);

    const { categoryId } = await this.publicationPolicy.assertCanPublish(
      dto.productId,
      dto.sellerId,
    );

    const existing = await this.store.findListingByProductId(dto.productId.trim());
    if (existing && isListingPublished(existing)) {
      throw new Error(`Product ${dto.productId} is already published on the marketplace.`);
    }

    const listing =
      existing ??
      createMarketplaceListing({
        id: this.idGenerator.generate(),
        productId: dto.productId,
        sellerId: dto.sellerId,
        categoryId,
      });

    const submitted = withListingStatus(
      Object.freeze({ ...listing, categoryId }),
      ListingStatus.PendingModeration,
    );

    if (existing) {
      await this.store.updateListing(submitted);
    } else {
      await this.store.saveListing(submitted);
    }

    await this.moderation.requestModeration({
      target: ModerationTarget.Listing,
      targetId: dto.productId,
      requestedBy: dto.sellerId,
    });

    return submitted;
  }

  async approveListing(dto: ApproveListingDto): Promise<MarketplaceListing> {
    const listing = await this.requireListingByProductId(dto.productId);
    if (!canListingBePublished(listing)) {
      throw new Error(`Listing for product ${dto.productId} cannot be approved.`);
    }

    await this.moderation.approve({
      target: ModerationTarget.Listing,
      targetId: dto.productId,
    });

    const approved = withListingPublished(listing);
    await this.store.updateListing(approved);
    createListingPublishedEvent(approved);

    return approved;
  }

  async rejectListing(dto: RejectListingDto): Promise<MarketplaceListing> {
    validateRejectListingDto(dto);

    const listing = await this.requireListingByProductId(dto.productId);
    if (!canListingBePublished(listing)) {
      throw new Error(`Listing for product ${dto.productId} cannot be rejected.`);
    }

    await this.moderation.reject({
      target: ModerationTarget.Listing,
      targetId: dto.productId,
      reason: dto.reason,
    });

    const rejected = withListingStatus(listing, ListingStatus.Unpublished);
    await this.store.updateListing(rejected);

    return rejected;
  }

  async unpublishListing(dto: UnpublishListingDto): Promise<MarketplaceListing> {
    validateUnpublishListingDto(dto);

    const listing = await this.requireListingByProductId(dto.productId);
    if (listing.sellerId !== dto.sellerId.trim()) {
      throw new Error(`Listing for product ${dto.productId} does not belong to seller ${dto.sellerId}.`);
    }
    if (!canListingBeUnpublished(listing)) {
      throw new Error(`Listing for product ${dto.productId} is not published.`);
    }

    const unpublished = withListingUnpublished(listing);
    await this.store.updateListing(unpublished);
    createListingUnpublishedEvent(unpublished);

    return unpublished;
  }

  async getListing(productId: string): Promise<MarketplaceListing | null> {
    return this.store.findListingByProductId(productId.trim());
  }

  async isPublished(productId: string): Promise<boolean> {
    const listing = await this.store.findListingByProductId(productId.trim());
    if (!listing || !isListingPublished(listing)) {
      return false;
    }

    const moderationStatus = await this.moderation.getStatus({
      target: ModerationTarget.Listing,
      targetId: productId.trim(),
    });

    return moderationStatus === ModerationStatus.Approved;
  }

  private async requireListingByProductId(productId: string): Promise<MarketplaceListing> {
    const listing = await this.store.findListingByProductId(productId.trim());
    if (!listing) {
      throw new Error(`Marketplace listing not found for product ${productId}.`);
    }
    return listing;
  }
}

function validatePublishListingDto(dto: PublishListingDto): void {
  if (!dto.productId?.trim()) {
    throw new Error("Product id is required.");
  }
  if (!dto.sellerId?.trim()) {
    throw new Error("Seller id is required.");
  }
}

function validateUnpublishListingDto(dto: UnpublishListingDto): void {
  if (!dto.productId?.trim()) {
    throw new Error("Product id is required.");
  }
  if (!dto.sellerId?.trim()) {
    throw new Error("Seller id is required.");
  }
}

function validateRejectListingDto(dto: RejectListingDto): void {
  if (!dto.productId?.trim()) {
    throw new Error("Product id is required.");
  }
  if (!dto.reason?.trim()) {
    throw new Error("Rejection reason is required.");
  }
}
