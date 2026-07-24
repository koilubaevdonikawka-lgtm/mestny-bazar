import type { OrderDTO } from "@shared/contracts/order";
import type {
  INotificationProvider,
  NotificationSubscribeRequest,
} from "@server/ports/notification.provider";

/** WhatsApp adapter — implemented in Stage 8. */
export class WhatsAppNotificationAdapter implements INotificationProvider {
  async sendOrderUpdate(_order: OrderDTO, _message: string): Promise<void> {
    throw new Error("WhatsAppNotificationAdapter.sendOrderUpdate not implemented (Stage 8)");
  }

  async subscribe(_request: NotificationSubscribeRequest): Promise<void> {
    throw new Error("WhatsAppNotificationAdapter.subscribe not implemented (Stage 8)");
  }
}
