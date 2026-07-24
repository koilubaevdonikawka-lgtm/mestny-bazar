import type { OrderDTO } from "@shared/contracts/order";

/** Dispatches order lifecycle events to operational roles. */
export interface IOrderEventNotifier {
  notifyAdmin(order: OrderDTO): Promise<void>;
  notifyWarehouse(order: OrderDTO): Promise<void>;
  notifyCourier(order: OrderDTO): Promise<void>;
}
