import type { SellerService } from "@server/application/modules/seller/seller/services";
import type {
  ApproveSellerDto,
  CreateSellerDto,
  SuspendSellerDto,
  UpdateSellerProfileDto,
} from "@server/application/modules/seller/seller/dto";
import type { Seller } from "@server/application/modules/seller/seller/models";
import { AnalyticsCapabilityEventName } from "@server/application/modules/analytics/analytics/services/analytics-capability-event-names";
import type { CapabilityEventPublisher } from "@server/infrastructure/analytics/capability-event-publisher";

/** Publishes seller capability events without modifying SellerService business logic. */
export class EventPublishingSellerService
  implements
    Pick<
      SellerService,
      | "createSeller"
      | "getSeller"
      | "updateProfile"
      | "approveSeller"
      | "suspendSeller"
      | "isSellerApproved"
    >
{
  constructor(
    private readonly inner: SellerService,
    private readonly publisher: CapabilityEventPublisher,
  ) {}

  createSeller(dto: CreateSellerDto): Promise<Seller> {
    return this.inner.createSeller(dto).then(async (seller) => {
      await this.publisher.publish({
        eventName: AnalyticsCapabilityEventName.SellerCreated,
        aggregateId: seller.id,
        aggregateType: "Seller",
        payload: { sellerId: seller.id, status: seller.status },
      });
      return seller;
    });
  }

  getSeller(sellerId: string): Promise<Seller | null> {
    return this.inner.getSeller(sellerId);
  }

  updateProfile(dto: UpdateSellerProfileDto): Promise<Seller> {
    return this.inner.updateProfile(dto);
  }

  approveSeller(dto: ApproveSellerDto): Promise<Seller> {
    return this.inner.approveSeller(dto).then(async (seller) => {
      await this.publisher.publish({
        eventName: AnalyticsCapabilityEventName.SellerApproved,
        aggregateId: seller.id,
        aggregateType: "Seller",
        payload: { sellerId: seller.id, status: seller.status },
      });
      return seller;
    });
  }

  suspendSeller(dto: SuspendSellerDto): Promise<Seller> {
    return this.inner.suspendSeller(dto).then(async (seller) => {
      await this.publisher.publish({
        eventName: AnalyticsCapabilityEventName.SellerSuspended,
        aggregateId: seller.id,
        aggregateType: "Seller",
        payload: { sellerId: seller.id, status: seller.status },
      });
      return seller;
    });
  }

  isSellerApproved(sellerId: string): Promise<boolean> {
    return this.inner.isSellerApproved(sellerId);
  }
}

export function asSellerService(wrapper: EventPublishingSellerService): SellerService {
  return wrapper as unknown as SellerService;
}
