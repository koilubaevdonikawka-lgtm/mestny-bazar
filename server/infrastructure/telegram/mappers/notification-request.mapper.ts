import type {
  DeleteMessageRequest,
  EditMessageRequest,
  NotificationParseMode,
  SendDocumentRequest,
  SendMessageRequest,
  SendPhotoRequest,
} from "@server/infrastructure/notifications";
import type { TelegramConfiguration } from "@server/infrastructure/telegram/configuration";
import { ChatTargetMapper } from "@server/infrastructure/telegram/mappers/chat-target.mapper";

/** Maps infrastructure notification requests to Telegram Bot API payloads. */
export class NotificationRequestMapper {
  private readonly chatTargetMapper = new ChatTargetMapper();

  constructor(private readonly configuration: TelegramConfiguration) {}

  toSendMessageBody(request: SendMessageRequest): Record<string, unknown> {
    return Object.freeze({
      ...this.chatTargetMapper.toTelegramPayload(request.target),
      text: request.text,
      parse_mode: request.parseMode ?? this.configuration.defaultParseMode,
      disable_notification: request.disableNotification ?? false,
      ...(request.replyToMessageId !== undefined
        ? { reply_to_message_id: request.replyToMessageId }
        : {}),
    });
  }

  toSendPhotoBody(request: SendPhotoRequest): Record<string, unknown> {
    return Object.freeze({
      ...this.chatTargetMapper.toTelegramPayload(request.target),
      photo: request.photoUrl,
      ...(request.caption ? { caption: request.caption } : {}),
      ...(request.parseMode || request.caption
        ? { parse_mode: request.parseMode ?? this.configuration.defaultParseMode }
        : {}),
    });
  }

  toSendDocumentBody(request: SendDocumentRequest): Record<string, unknown> {
    return Object.freeze({
      ...this.chatTargetMapper.toTelegramPayload(request.target),
      document: request.documentUrl,
      ...(request.fileName ? { filename: request.fileName } : {}),
      ...(request.caption ? { caption: request.caption } : {}),
      ...(request.parseMode || request.caption
        ? { parse_mode: request.parseMode ?? this.configuration.defaultParseMode }
        : {}),
    });
  }

  toEditMessageBody(request: EditMessageRequest): Record<string, unknown> {
    return Object.freeze({
      ...this.chatTargetMapper.toTelegramPayload(request.target),
      message_id: request.messageId,
      text: request.text,
      parse_mode: request.parseMode ?? this.configuration.defaultParseMode,
    });
  }

  toDeleteMessageBody(request: DeleteMessageRequest): Record<string, unknown> {
    return Object.freeze({
      ...this.chatTargetMapper.toTelegramPayload(request.target),
      message_id: request.messageId,
    });
  }

  resolveParseMode(parseMode?: NotificationParseMode): NotificationParseMode {
    return parseMode ?? this.configuration.defaultParseMode;
  }
}
