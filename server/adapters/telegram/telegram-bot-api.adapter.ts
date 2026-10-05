import type { ITelegramBotApi, TelegramDownloadedFile } from "@server/ports/telegram-bot-api.port";
import { RetryableError } from "@shared/lib/with-retry";

const FETCH_TIMEOUT_MS = 15_000;

export interface TelegramBotApiAdapterConfig {
  botToken: string;
}

/**
 * Задача №264 — official Telegram Bot API (core.telegram.org/bots/api),
 * plain HTTPS + JSON, no SDK dependency needed for the two calls this
 * feature uses (sendMessage, getFile → file download).
 */
export class TelegramBotApiAdapter implements ITelegramBotApi {
  private readonly apiBase: string;
  private readonly fileBase: string;

  constructor(config: TelegramBotApiAdapterConfig) {
    this.apiBase = `https://api.telegram.org/bot${config.botToken}`;
    this.fileBase = `https://api.telegram.org/file/bot${config.botToken}`;
  }

  /**
   * Failures that may succeed on a second try — HTTP 429 (flood limit), 5xx and
   * a network error — are thrown as RetryableError for callers using withRetry;
   * 4xx (blocked bot, bad chat id) and a timeout are plain errors, not retried.
   */
  async sendMessage(chatId: number, text: string): Promise<void> {
    let response: Response;
    try {
      response = await fetch(`${this.apiBase}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      const message = `Telegram sendMessage failed: ${timedOut ? "timeout" : "network error"}`;
      throw timedOut ? new Error(message, { cause: error }) : new RetryableError(message, error);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const message = `Telegram sendMessage failed: HTTP ${response.status} ${body}`.trim();
      throw response.status === 429 || response.status >= 500
        ? new RetryableError(message)
        : new Error(message);
    }
  }

  async downloadFile(fileId: string): Promise<TelegramDownloadedFile> {
    const getFileResponse = await fetch(
      `${this.apiBase}/getFile?file_id=${encodeURIComponent(fileId)}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
    );
    if (!getFileResponse.ok) {
      const body = await getFileResponse.text().catch(() => "");
      throw new Error(`Telegram getFile failed: HTTP ${getFileResponse.status} ${body}`.trim());
    }
    const getFileData = (await getFileResponse.json()) as {
      ok: boolean;
      result?: { file_path?: string };
    };
    const filePath = getFileData.result?.file_path;
    if (!getFileData.ok || !filePath) {
      throw new Error("Telegram getFile response contained no file_path");
    }

    const fileResponse = await fetch(`${this.fileBase}/${filePath}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!fileResponse.ok) {
      throw new Error(`Telegram file download failed: HTTP ${fileResponse.status}`);
    }

    // Задача №268 — hardcoded, not read from the response header. Real
    // production failure confirmed via wrangler tail: Telegram's file
    // server returned a real, present "content-type: application/octet-stream"
    // header for a downloaded photo — not omitted, just generic/wrong — so
    // the previous `fileResponse.headers.get(...) || "image/jpeg"` fallback
    // never triggered (the header WAS there) and the wrong MIME type
    // reached MediaUploadService.uploadImage()'s allow-list check,
    // throwing MediaUploadValidationError for every single photo sent.
    // Telegram's Bot API re-encodes every uploaded "photo" to JPEG
    // server-side (confirmed earlier, Задача №264 STEP 0) — that's a fact
    // about Telegram's own behavior, not about what this one response
    // happens to report, so it's used directly instead of trusting the
    // response header at all.
    const contentType = "image/jpeg";
    const data = Buffer.from(await fileResponse.arrayBuffer());
    return { data, contentType };
  }
}
