import type { OrderDTO } from "@shared/contracts/order";
import type {
  INotificationProvider,
  NotificationSubscribeRequest,
} from "@server/ports/notification.provider";
import { logger } from "@shared/observability/logger";

/** Logs notifications until Telegram/WhatsApp adapters are fully wired. */
export class StubNotificationAdapter implements INotificationProvider {
  async sendOrderUpdate(order: OrderDTO, message: string): Promise<void> {
    logger.info("notification:stub", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      message,
    });
  }

  async subscribe(request: NotificationSubscribeRequest): Promise<void> {
    logger.info("notification:stub subscribe", { request });
  }
}
