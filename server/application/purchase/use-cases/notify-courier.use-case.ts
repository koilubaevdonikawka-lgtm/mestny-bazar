import type { NotificationModule } from "@server/application/modules/notification/notification/api/notification.module";
import {
  NotificationChannel,
  NotificationRecipientType,
  createNotificationRecipient,
} from "@server/application/modules/notification/notification/models";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { NotifyOrderInput } from "@server/application/purchase/dto";
import type { Notification } from "@server/application/modules/notification/notification/models";
import { resolveCourierChatId } from "@server/application/purchase/services/purchase-notification-targets";

/** Notify courier via Telegram about a delivery assignment via Notification BCM. */
export class NotifyCourierUseCase {
  constructor(private readonly notifications: NotificationModule) {}

  async execute(input: NotifyOrderInput): Promise<UseCaseResult<Notification | null>> {
    const chatId = resolveCourierChatId();
    if (!chatId) {
      return useCaseResult(null);
    }

    const notification = await this.notifications.send({
      channel: NotificationChannel.Telegram,
      recipient: createNotificationRecipient({
        type: NotificationRecipientType.Admin,
        id: "courier",
        address: chatId,
      }),
      body: [
        "<b>[КУРЬЕР]</b> Новый заказ на доставку",
        `Заказ: #${input.orderNumber}`,
        `Адрес: ${input.address}`,
        `Телефон: ${input.phone}`,
        `Сумма: ${input.totalAmount} ${input.currency}`,
      ].join("\n"),
      metadata: Object.freeze({
        orderId: input.orderId,
        template: "courier.order_assigned",
      }),
    });

    return useCaseResult(notification);
  }
}
