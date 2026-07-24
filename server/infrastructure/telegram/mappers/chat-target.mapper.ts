import type { NotificationChatTarget } from "@server/infrastructure/notifications";

/** Maps infrastructure chat targets to Telegram Bot API chat identifiers. */
export class ChatTargetMapper {
  toTelegramChatId(target: NotificationChatTarget): string | number {
    const trimmed = target.chatId.trim();
    if (/^-?\d+$/.test(trimmed)) {
      return Number(trimmed);
    }
    return trimmed;
  }

  toTelegramPayload(target: NotificationChatTarget): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      chat_id: this.toTelegramChatId(target),
    };

    if (target.threadId !== undefined) {
      payload.message_thread_id = target.threadId;
    }

    return Object.freeze(payload);
  }
}
