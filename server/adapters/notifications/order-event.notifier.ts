import type { OrderDTO } from "@shared/contracts/order";
import type { IOrderEventNotifier } from "@server/ports/order-events.port";
import type { INotificationProvider } from "@server/ports/notification.provider";

/**
 * Routes order events through INotificationProvider with role-specific
 * messages. Admin and staff (warehouse/courier) take separate channels: only
 * admins have a real channel today (Telegram, via telegram_bot_admins) —
 * sending all three roles' messages through it would hand every admin three
 * near-identical messages per order, so warehouse/courier stay on the
 * logging stub until they get recipients of their own.
 */
export class OrderEventNotifier implements IOrderEventNotifier {
  constructor(
    private readonly adminChannel: INotificationProvider,
    private readonly staffChannel: INotificationProvider,
  ) {}

  async notifyAdmin(order: OrderDTO): Promise<void> {
    await this.adminChannel.sendOrderUpdate(order, `🛒 Новый заказ #${order.orderNumber}`);
  }

  async notifyWarehouse(order: OrderDTO): Promise<void> {
    await this.staffChannel.sendOrderUpdate(
      order,
      `[WAREHOUSE] Собрать заказ #${order.orderNumber}: ${order.items.length} позиций`,
    );
  }

  async notifyCourier(order: OrderDTO): Promise<void> {
    await this.staffChannel.sendOrderUpdate(
      order,
      `[COURIER/TELEGRAM] Доставить заказ #${order.orderNumber} по адресу: ${order.addressSnapshot}`,
    );
  }
}
