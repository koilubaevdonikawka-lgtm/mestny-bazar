import type { ITelegramClientProvider } from "@server/infrastructure/telegram/client/i-telegram-client-provider";
import type { TelegramConfiguration } from "@server/infrastructure/telegram/configuration";
import {
  TelegramInfrastructureError,
  type TelegramApiResponse,
  type TelegramHttpRequestOptions,
  type TelegramHttpResponse,
} from "@server/infrastructure/telegram/shared";

/** Encapsulates Telegram Bot API client creation and authenticated requests. */
export class TelegramClientProvider implements ITelegramClientProvider {
  constructor(private readonly configuration: TelegramConfiguration) {
    Object.freeze(this);
  }

  async request<T>(options: TelegramHttpRequestOptions): Promise<TelegramHttpResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.configuration.timeoutMs);

    try {
      const response = await fetch(this.configuration.botApiUrl(options.methodName), {
        method: options.method,
        headers: Object.freeze({
          "content-type": "application/json",
          accept: "application/json",
        }),
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });

      const text = await response.text();
      const data = text
        ? (JSON.parse(text) as TelegramApiResponse<T>)
        : ({ ok: false } as TelegramApiResponse<T>);

      if (!response.ok || !data.ok) {
        throw new TelegramInfrastructureError(
          "Telegram Bot API request failed",
          data.error_code ?? response.status,
          data.description ?? text,
        );
      }

      return Object.freeze({
        status: response.status,
        data,
      });
    } catch (error) {
      if (error instanceof TelegramInfrastructureError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new TelegramInfrastructureError("Telegram Bot API request timed out", 408);
      }
      throw new TelegramInfrastructureError(
        "Telegram Bot API request failed",
        undefined,
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

export type { ITelegramClientProvider } from "@server/infrastructure/telegram/client/i-telegram-client-provider";
