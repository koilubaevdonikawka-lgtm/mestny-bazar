import type { OrderDTO } from "@shared/contracts/order";
import type { IOrderEventNotifier } from "@server/ports/order-events.port";
import type { INotificationProvider } from "@server/ports/notification.provider";

/** Stub notifier — routes events through INotificationProvider with role-specific messages. */
export class StubOrderEventNotifier implements IOrderEventNotifier {
  constructor(private readonly notifications: INotificationProvider) {}

  async notifyAdmin(order: OrderDTO): Promise<void> {
    await this.notifications.sendOrderUpdate(
      order,
      `[ADMIN] Новый заказ #${order.orderNumber} на сумму ${order.total} ${order.currency}`,
    );
  }

  async notifyWarehouse(order: OrderDTO): Promise<void> {
    await this.notifications.sendOrderUpdate(
      order,
      `[WAREHOUSE] Собрать заказ #${order.orderNumber}: ${order.items.length} позиций`,
    );
  }

  async notifyCourier(order: OrderDTO): Promise<void> {
    await this.notifications.sendOrderUpdate(
      order,
      `[COURIER/TELEGRAM] Доставить заказ #${order.orderNumber} по адресу: ${order.addressSnapshot}`,
    );
  }
}
