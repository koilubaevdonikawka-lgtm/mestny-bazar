import type { Order } from "@server/application/modules/order/order/models";
import type { Payment } from "@server/application/modules/payment/payment/models";
import type { ReservedStockLine } from "@server/application/modules/order-fulfillment/order-fulfillment/models/reserved-stock-line.model";
import type { WarehouseTask } from "@server/application/modules/warehouse/warehouse/models";

/** Result of a completed order fulfillment business process. */
export interface FulfillmentResult {
  readonly orderId: string;
  readonly paymentId: string;
  readonly orderStatus: Order["status"];
  readonly paymentStatus: Payment["status"];
  readonly warehouseTask: WarehouseTask;
  readonly reservedItems: readonly ReservedStockLine[];
}

export function createFulfillmentResult(input: FulfillmentResult): FulfillmentResult {
  return Object.freeze({
    orderId: input.orderId,
    paymentId: input.paymentId,
    orderStatus: input.orderStatus,
    paymentStatus: input.paymentStatus,
    warehouseTask: input.warehouseTask,
    reservedItems: Object.freeze([...input.reservedItems]),
  });
}
