import type { Order, OrderStatus } from "@server/application/modules/order/order/models";

/** Hook invoked after order lifecycle changes inside Order BCM. */
export interface IOrderStatusChangeHook {
  onOrderCreated(order: Order): Promise<void>;
  onStatusChanged(input: {
    order: Order;
    previousStatus: OrderStatus;
    reason?: string | null;
    actor?: string | null;
  }): Promise<void>;
}
