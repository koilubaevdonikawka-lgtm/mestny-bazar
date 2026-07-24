import type { StartDeliveryDto } from "@server/application/modules/delivery/delivery/dto";
import type { DeliveryResult } from "@server/application/modules/delivery/delivery/models";
import type { DeliveryProcess } from "@server/application/modules/delivery/delivery/processes";

/** Delivery process service — delegates orchestration to DeliveryProcess. */
export class DeliveryService {
  constructor(private readonly process: DeliveryProcess) {}

  startDelivery(input: StartDeliveryDto): Promise<DeliveryResult> {
    return this.process.execute(input);
  }
}
