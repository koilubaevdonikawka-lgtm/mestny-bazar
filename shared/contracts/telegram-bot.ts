/**
 * Задача №264 — Telegram bot for admin-driven draft product creation.
 * Own URL, not Telegram-dictated (mirrors FINIK_WEBHOOK_PATH's own comment
 * in payment.ts) — the single shared constant backs both the raw-fetch
 * interception in src/server.ts and scripts/setup-telegram-webhook.mjs's
 * setWebhook call, so the two can never drift apart.
 */
export const TELEGRAM_WEBHOOK_PATH = "/api/telegram-webhook";
