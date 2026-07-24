import type { OrderDTO } from "@shared/contracts/order";
import type {
  INotificationProvider,
  NotificationSubscribeRequest,
} from "@server/ports/notification.provider";

/** Logs notifications until Telegram/WhatsApp adapters are fully wired. */
export class StubNotificationAdapter implements INotificationProvider {
  async sendOrderUpdate(order: OrderDTO, message: string): Promise<void> {
    console.info("[notification:stub]", { orderId: order.id, orderNumber: order.orderNumber, message });
  }

  async subscribe(request: NotificationSubscribeRequest): Promise<void> {
    console.info("[notification:stub] subscribe", request);
  }
}
