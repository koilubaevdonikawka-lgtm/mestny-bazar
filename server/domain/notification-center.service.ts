import type {
  INotificationCenter,
  NotificationEvent,
} from "@server/ports/notification-center.port";
import type {
  INotificationProvider,
  NotificationSubscribeRequest,
} from "@server/ports/notification.provider";
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
        const unknown: never = event as never;
        throw new Error(`Unknown notification event: ${(unknown as NotificationEvent).type}`);
      }
    }
  }

  async subscribe(request: NotificationSubscribeRequest): Promise<void> {
    await this.provider.subscribe(request);
  }

  /**
   * Each recipient is an independent side effect — one channel failing (e.g. a
   * notification provider outage) must not obscure whether the other two
   * succeeded, and must not read as "notifyOrderCreated failed" with no
   * indication of which recipient actually didn't get notified.
   */
  private async dispatchOrderCreated(order: OrderDTO): Promise<void> {
    const results = await Promise.allSettled([
      this.orderEvents.notifyAdmin(order),
      this.orderEvents.notifyWarehouse(order),
      this.orderEvents.notifyCourier(order),
    ]);

    const recipients = ["admin", "warehouse", "courier"] as const;
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `[NotificationCenter] Failed to notify ${recipients[index]} for order ${order.id}:`,
          result.reason,
        );
      }
    });
  }
}
