import type {
  INotificationProvider as ApplicationNotificationProvider,
  NotificationDeliveryRequest,
  NotificationDeliveryResult,
} from "@server/application/modules/notification/notification/contracts";
import {
  NotificationChannel,
  NotificationStatus,
} from "@server/application/modules/notification/notification/models";
import type { INotificationProvider as InfrastructureNotificationProvider } from "@server/infrastructure/notifications";

/** Adapts the infrastructure notification provider to the Notification module contract. */
export class ProviderNotificationProvider implements ApplicationNotificationProvider {
  constructor(private readonly provider: InfrastructureNotificationProvider) {}

  async send(request: NotificationDeliveryRequest): Promise<NotificationDeliveryResult> {
    if (request.channel !== NotificationChannel.Telegram) {
      throw new Error(`Notification channel "${request.channel}" is not supported yet.`);
    }

    const chatId = request.recipient.address?.trim() || request.recipient.id.trim();
    if (!chatId) {
      throw new Error("Notification recipient address is required.");
    }

    const response = await this.provider.sendMessage({
      target: Object.freeze({ chatId }),
      text: request.body,
      parseMode: request.parseMode ?? "HTML",
      metadata: request.metadata,
    });

    return Object.freeze({
      externalMessageId: String(response.messageId),
      status: NotificationStatus.Sent,
    });
  }
}
