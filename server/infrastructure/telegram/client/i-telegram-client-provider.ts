import type {
  TelegramHttpRequestOptions,
  TelegramHttpResponse,
} from "@server/infrastructure/telegram/shared";

/** Provides HTTP access to the Telegram Bot API. */
export interface ITelegramClientProvider {
  request<T>(options: TelegramHttpRequestOptions): Promise<TelegramHttpResponse<T>>;
}
