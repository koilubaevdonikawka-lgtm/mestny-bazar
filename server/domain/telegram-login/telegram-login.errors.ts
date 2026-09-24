/** Thrown when the widget payload's hash doesn't match TELEGRAM_BOT_TOKEN's own HMAC — either a forged/tampered payload, or the wrong bot token configured. */
export class InvalidTelegramSignatureError extends Error {
  constructor(message = "Не удалось подтвердить вход через Telegram. Попробуйте ещё раз.") {
    super(message);
    this.name = "InvalidTelegramSignatureError";
  }
}

/** Thrown when auth_date falls outside the replay-protection window (§ verify-telegram-login-payload.ts). */
export class StaleTelegramAuthError extends Error {
  constructor(
    message = "Сессия входа через Telegram устарела. Обновите страницу и попробуйте снова.",
  ) {
    super(message);
    this.name = "StaleTelegramAuthError";
  }
}

/** Thrown when TELEGRAM_BOT_TOKEN is not configured — the login button exists but the server can't verify anything. */
export class TelegramLoginNotConfiguredError extends Error {
  constructor(message = "Вход через Telegram временно недоступен.") {
    super(message);
    this.name = "TelegramLoginNotConfiguredError";
  }
}
