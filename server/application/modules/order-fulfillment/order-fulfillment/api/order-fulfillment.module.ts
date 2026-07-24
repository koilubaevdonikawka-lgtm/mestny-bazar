import type { StartFulfillmentDto } from "@server/application/modules/order-fulfillment/order-fulfillment/dto";
import type { FulfillmentResult } from "@server/application/modules/order-fulfillment/order-fulfillment/models";
import type { OrderFulfillmentService } from "@server/application/modules/order-fulfillment/order-fulfillment/services";

/** Public entry point for the Order Fulfillment business process module. */
export class OrderFulfillmentModule {
  constructor(private readonly service: OrderFulfillmentService) {}

  fulfillOrder(input: StartFulfillmentDto): Promise<FulfillmentResult> {
    return this.service.fulfillOrder(input);
  }
}
