import type { Order } from "@server/application/modules/order/order/models";
import type { ReturnRequest } from "@server/application/modules/returns/returns/models/return-request.model";
import type { ReturnedItem } from "@server/application/modules/returns/returns/models/returned-item.model";
import type { StartReturnDto } from "@server/application/modules/returns/returns/dto";

/** Transient orchestration context for the returns business process. */
export interface ReturnContext {
  readonly request: StartReturnDto;
  order?: Order;
  returnRequest?: ReturnRequest;
  returnedItems?: readonly ReturnedItem[];
  updatedOrder?: Order;
}

export function createReturnContext(request: StartReturnDto): ReturnContext {
  return Object.freeze({ request: Object.freeze({ ...request }) });
}

export function withReturnOrder(context: ReturnContext, order: Order): ReturnContext {
  return Object.freeze({ ...context, order });
}

export function withReturnRequest(context: ReturnContext, returnRequest: ReturnRequest): ReturnContext {
  return Object.freeze({ ...context, returnRequest });
}

export function withReturnedItems(
  context: ReturnContext,
  returnedItems: readonly ReturnedItem[],
): ReturnContext {
  return Object.freeze({ ...context, returnedItems: Object.freeze([...returnedItems]) });
}

export function withReturnUpdatedOrder(context: ReturnContext, updatedOrder: Order): ReturnContext {
  return Object.freeze({ ...context, updatedOrder });
}
