import type { StartFulfillmentDto } from "@server/application/modules/order-fulfillment/order-fulfillment/dto";
import type { FulfillmentResult } from "@server/application/modules/order-fulfillment/order-fulfillment/models";
import type { OrderFulfillmentProcess } from "@server/application/modules/order-fulfillment/order-fulfillment/processes";

/** Order fulfillment process service — delegates orchestration to OrderFulfillmentProcess. */
export class OrderFulfillmentService {
  constructor(private readonly process: OrderFulfillmentProcess) {}

  fulfillOrder(input: StartFulfillmentDto): Promise<FulfillmentResult> {
    return this.process.execute(input);
  }
}
