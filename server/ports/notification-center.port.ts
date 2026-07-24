import type { OrderDTO } from "@shared/contracts/order";
import type { NotificationSubscribeRequest } from "@server/ports/notification.provider";

/** Unified notification events routed through NotificationCenter. */
export type NotificationEvent = { type: "order.created"; order: OrderDTO };

export interface INotificationCenter {
  dispatch(event: NotificationEvent): Promise<void>;
  subscribe(request: NotificationSubscribeRequest): Promise<void>;
}
