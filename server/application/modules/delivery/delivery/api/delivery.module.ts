import type { StartDeliveryDto } from "@server/application/modules/delivery/delivery/dto";
import type { DeliveryResult } from "@server/application/modules/delivery/delivery/models";
import type { DeliveryService } from "@server/application/modules/delivery/delivery/services";
import type { CreateComplaintDto } from "@server/application/modules/support/support/dto";
import type { Complaint } from "@server/application/modules/support/support/models";
import type { SupportModule } from "@server/application/modules/support/support/api/support.module";

/** Public entry point for the Delivery business process module. */
export class DeliveryModule {
  constructor(
    private readonly service: DeliveryService,
    private readonly support: SupportModule,
  ) {}

  startDelivery(input: StartDeliveryDto): Promise<DeliveryResult> {
    return this.service.startDelivery(input);
  }

  createComplaint(dto: CreateComplaintDto): Promise<Complaint> {
    return this.support.createComplaint(dto);
  }
}
