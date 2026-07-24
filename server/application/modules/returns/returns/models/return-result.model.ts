import type { Order } from "@server/application/modules/order/order/models";
import type { ReturnRequest } from "@server/application/modules/returns/returns/models/return-request.model";
import type { ReturnedItem } from "@server/application/modules/returns/returns/models/returned-item.model";

/** Result of a completed returns business process. */
export interface ReturnResult {
  readonly orderId: string;
  readonly orderStatus: Order["status"];
  readonly returnRequest: ReturnRequest;
  readonly returnedItems: readonly ReturnedItem[];
}

export function createReturnResult(input: ReturnResult): ReturnResult {
  return Object.freeze({
    orderId: input.orderId,
    orderStatus: input.orderStatus,
    returnRequest: input.returnRequest,
    returnedItems: Object.freeze([...input.returnedItems]),
  });
}
