import type { Order } from "@server/application/modules/order/order/models";
import type { Payment } from "@server/application/modules/payment/payment/models";
import type { FulfillmentRequest } from "@server/application/modules/order-fulfillment/order-fulfillment/models/fulfillment-request.model";
import type { ReservedStockLine } from "@server/application/modules/order-fulfillment/order-fulfillment/models/reserved-stock-line.model";
import type { WarehouseTask } from "@server/application/modules/warehouse/warehouse/models";

/** Transient orchestration context for the order fulfillment business process. */
export interface FulfillmentContext {
  readonly request: FulfillmentRequest;
  order?: Order;
  payment?: Payment;
  reservedItems?: readonly ReservedStockLine[];
  updatedOrder?: Order;
  warehouseTask?: WarehouseTask;
}

export function createFulfillmentContext(request: FulfillmentRequest): FulfillmentContext {
  return Object.freeze({ request });
}

export function withFulfillmentOrder(context: FulfillmentContext, order: Order): FulfillmentContext {
  return Object.freeze({ ...context, order });
}

export function withFulfillmentPayment(context: FulfillmentContext, payment: Payment): FulfillmentContext {
  return Object.freeze({ ...context, payment });
}

export function withFulfillmentReservedItems(
  context: FulfillmentContext,
  reservedItems: readonly ReservedStockLine[],
): FulfillmentContext {
  return Object.freeze({ ...context, reservedItems });
}

export function withFulfillmentUpdatedOrder(
  context: FulfillmentContext,
  updatedOrder: Order,
): FulfillmentContext {
  return Object.freeze({ ...context, updatedOrder });
}

export function withFulfillmentWarehouseTask(
  context: FulfillmentContext,
  warehouseTask: WarehouseTask,
): FulfillmentContext {
  return Object.freeze({ ...context, warehouseTask });
}
