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
import { resolveWarehouseChatId } from "@server/application/purchase/services/purchase-notification-targets";

/** Notify warehouse staff about a new order to assemble via Notification BCM. */
export class NotifyWarehouseUseCase {
  constructor(private readonly notifications: NotificationModule) {}

  async execute(input: NotifyOrderInput): Promise<UseCaseResult<Notification | null>> {
    const chatId = resolveWarehouseChatId();
    if (!chatId) {
      return useCaseResult(null);
    }

    const notification = await this.notifications.send({
      channel: NotificationChannel.Telegram,
      recipient: createNotificationRecipient({
        type: NotificationRecipientType.Admin,
        id: "warehouse",
        address: chatId,
      }),
      body: [
        "<b>[СКЛАД]</b> Новый заказ к сборке",
        `Заказ: #${input.orderNumber}`,
        `Позиций: ${input.itemCount}`,
        `Сумма: ${input.totalAmount} ${input.currency}`,
        `Адрес: ${input.address}`,
        `Телефон: ${input.phone}`,
      ].join("\n"),
      metadata: Object.freeze({
        orderId: input.orderId,
        template: "warehouse.order_created",
      }),
    });

    return useCaseResult(notification);
  }
}
