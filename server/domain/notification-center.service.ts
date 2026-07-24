import type { INotificationCenter, NotificationEvent } from "@server/ports/notification-center.port";
import type { INotificationProvider, NotificationSubscribeRequest } from "@server/ports/notification.provider";
import type { IOrderEventNotifier } from "@server/ports/order-events.port";
import type { OrderDTO } from "@shared/contracts/order";

/**
 * Single entry point for all system notifications.
 * Routes events to existing order-event and provider ports/adapters.
 */
export class NotificationCenter implements INotificationCenter {
  constructor(
    private readonly orderEvents: IOrderEventNotifier,
    private readonly provider: INotificationProvider,
  ) {}

  async dispatch(event: NotificationEvent): Promise<void> {
    switch (event.type) {
      case "order.created":
        await this.dispatchOrderCreated(event.order);
        return;
      default: {
        const unknown: never = event;
        throw new Error(`Unknown notification event: ${(unknown as NotificationEvent).type}`);
      }
    }
  }

  async subscribe(request: NotificationSubscribeRequest): Promise<void> {
    await this.provider.subscribe(request);
  }

  private async dispatchOrderCreated(order: OrderDTO): Promise<void> {
    await Promise.all([
      this.orderEvents.notifyAdmin(order),
      this.orderEvents.notifyWarehouse(order),
      this.orderEvents.notifyCourier(order),
    ]);
  }
}
