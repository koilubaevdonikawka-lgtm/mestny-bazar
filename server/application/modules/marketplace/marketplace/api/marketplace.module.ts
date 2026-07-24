import type {
  ApproveListingDto,
  PublishListingDto,
  RejectListingDto,
  UnpublishListingDto,
} from "@server/application/modules/marketplace/marketplace/dto";
import type { MarketplaceListing } from "@server/application/modules/marketplace/marketplace/models";
import type { MarketplaceService } from "@server/application/modules/marketplace/marketplace/services";
import type { CreateComplaintDto } from "@server/application/modules/support/support/dto";
import type { Complaint } from "@server/application/modules/support/support/models";
import type { SupportModule } from "@server/application/modules/support/support/api/support.module";

/** Public entry point for the Marketplace business capability module. */
export class MarketplaceModule {
  constructor(
    private readonly service: MarketplaceService,
    private readonly support: SupportModule,
  ) {}

  publishListing(dto: PublishListingDto): Promise<MarketplaceListing> {
    return this.service.publishListing(dto);
  }

  approveListing(dto: ApproveListingDto): Promise<MarketplaceListing> {
    return this.service.approveListing(dto);
  }

  rejectListing(dto: RejectListingDto): Promise<MarketplaceListing> {
    return this.service.rejectListing(dto);
  }

  unpublishListing(dto: UnpublishListingDto): Promise<MarketplaceListing> {
    return this.service.unpublishListing(dto);
  }

  getListing(productId: string): Promise<MarketplaceListing | null> {
    return this.service.getListing(productId);
  }

  isPublished(productId: string): Promise<boolean> {
    return this.service.isPublished(productId);
  }

  createComplaint(dto: CreateComplaintDto): Promise<Complaint> {
    return this.support.createComplaint(dto);
  }
}
