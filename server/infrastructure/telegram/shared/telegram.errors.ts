/** Raised when Telegram Bot API returns an error response. */
export class TelegramInfrastructureError extends Error {
  readonly code = "infrastructure.telegram_error";

  constructor(
    message: string,
    readonly statusCode?: number,
    readonly details?: string,
  ) {
    super(details ? `${message}: ${details}` : message);
    this.name = "TelegramInfrastructureError";
  }
}
