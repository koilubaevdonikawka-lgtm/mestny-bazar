import { getServerEnv } from "@server/config/env";

/** Resolves Telegram chat id for admin notifications. */
export function resolveAdminChatId(): string | null {
  return readChatId(process.env.TELEGRAM_ADMIN_CHAT_ID);
}

/** Resolves Telegram chat id for warehouse notifications. */
export function resolveWarehouseChatId(): string | null {
  return readChatId(process.env.TELEGRAM_WAREHOUSE_CHAT_ID);
}

/** Resolves Telegram chat id for courier notifications. */
export function resolveCourierChatId(): string | null {
  return readChatId(process.env.TELEGRAM_COURIER_CHAT_ID);
}

/** Returns true when Telegram bot token is configured for outbound notifications. */
export function isTelegramConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(env.TELEGRAM_BOT_TOKEN?.trim());
}

function readChatId(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
