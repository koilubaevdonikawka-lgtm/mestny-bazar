import type {
  ApproveSellerDto,
  CreateSellerDto,
  SuspendSellerDto,
  UpdateSellerProfileDto,
} from "@server/application/modules/seller/seller/dto";
import type { Seller } from "@server/application/modules/seller/seller/models";
import type { SellerService } from "@server/application/modules/seller/seller/services";
import type { CreateComplaintDto } from "@server/application/modules/support/support/dto";
import type { Complaint } from "@server/application/modules/support/support/models";
import type { SupportModule } from "@server/application/modules/support/support/api/support.module";

/** Public entry point for the Seller business capability module. */
export class SellerModule {
  constructor(
    private readonly service: SellerService,
    private readonly support: SupportModule,
  ) {}

  createSeller(dto: CreateSellerDto): Promise<Seller> {
    return this.service.createSeller(dto);
  }

  getSeller(sellerId: string): Promise<Seller | null> {
    return this.service.getSeller(sellerId);
  }

  updateProfile(dto: UpdateSellerProfileDto): Promise<Seller> {
    return this.service.updateProfile(dto);
  }

  approveSeller(dto: ApproveSellerDto): Promise<Seller> {
    return this.service.approveSeller(dto);
  }

  suspendSeller(dto: SuspendSellerDto): Promise<Seller> {
    return this.service.suspendSeller(dto);
  }

  isSellerApproved(sellerId: string): Promise<boolean> {
    return this.service.isSellerApproved(sellerId);
  }

  createComplaint(dto: CreateComplaintDto): Promise<Complaint> {
    return this.support.createComplaint(dto);
  }
}
