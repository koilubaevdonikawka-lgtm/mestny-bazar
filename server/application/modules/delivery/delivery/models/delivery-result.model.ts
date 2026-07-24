import type { Order } from "@server/application/modules/order/order/models";
import type { CourierAssignment } from "@server/application/modules/courier/courier/models";
import type { DeliveryTask } from "@server/application/modules/delivery/delivery/models/delivery-task.model";

/** Result of a completed delivery business process. */
export interface DeliveryResult {
  readonly orderId: string;
  readonly orderStatus: Order["status"];
  readonly courierAssignment: CourierAssignment;
  readonly deliveryTask: DeliveryTask;
}

export function createDeliveryResult(input: DeliveryResult): DeliveryResult {
  return Object.freeze({
    orderId: input.orderId,
    orderStatus: input.orderStatus,
    courierAssignment: input.courierAssignment,
    deliveryTask: input.deliveryTask,
  });
}
