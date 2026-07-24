import type { Order } from "@server/application/modules/order/order/models";
import type { CourierAssignment } from "@server/application/modules/courier/courier/models";
import type { DeliveryRequest } from "@server/application/modules/delivery/delivery/models/delivery-request.model";
import type { DeliveryTask } from "@server/application/modules/delivery/delivery/models/delivery-task.model";

/** Transient orchestration context for the delivery business process. */
export interface DeliveryContext {
  readonly request: DeliveryRequest;
  order?: Order;
  courierAssignment?: CourierAssignment;
  updatedOrder?: Order;
  deliveryTask?: DeliveryTask;
}

export function createDeliveryContext(request: DeliveryRequest): DeliveryContext {
  return Object.freeze({ request });
}

export function withDeliveryOrder(context: DeliveryContext, order: Order): DeliveryContext {
  return Object.freeze({ ...context, order });
}

export function withDeliveryCourierAssignment(
  context: DeliveryContext,
  courierAssignment: CourierAssignment,
): DeliveryContext {
  return Object.freeze({ ...context, courierAssignment });
}

export function withDeliveryUpdatedOrder(context: DeliveryContext, updatedOrder: Order): DeliveryContext {
  return Object.freeze({ ...context, updatedOrder });
}

export function withDeliveryTask(context: DeliveryContext, deliveryTask: DeliveryTask): DeliveryContext {
  return Object.freeze({ ...context, deliveryTask });
}
