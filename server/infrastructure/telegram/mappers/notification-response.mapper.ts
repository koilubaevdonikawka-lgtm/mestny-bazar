import type { NotificationResponse } from "@server/infrastructure/notifications";
import type { TelegramMessageResource } from "@server/infrastructure/telegram/shared";

/** Maps Telegram Bot API responses to infrastructure notification responses. */
export class NotificationResponseMapper {
  toSentResponse(message: TelegramMessageResource): NotificationResponse {
    return Object.freeze({
      messageId: message.message_id,
      chatId: String(message.chat.id),
      status: "sent",
      raw: Object.freeze({ ...message }),
    });
  }

  toEditedResponse(message: TelegramMessageResource): NotificationResponse {
    return Object.freeze({
      messageId: message.message_id,
      chatId: String(message.chat.id),
      status: "edited",
      raw: Object.freeze({ ...message }),
    });
  }

  toDeletedResponse(chatId: string, messageId: number): NotificationResponse {
    return Object.freeze({
      messageId,
      chatId,
      status: "deleted",
    });
  }
}
