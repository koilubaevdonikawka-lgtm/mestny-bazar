import type { ITelegramBotApi, TelegramDownloadedFile } from "@server/ports/telegram-bot-api.port";

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

  async sendMessage(chatId: number, text: string): Promise<void> {
    const response = await fetch(`${this.apiBase}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Telegram sendMessage failed: HTTP ${response.status} ${body}`.trim());
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

    // Telegram photos are always served as JPEG (Bot API re-encodes every
    // uploaded "photo" server-side); falling back to that when the response
    // omits content-type (some CDN edges do) rather than guessing from the
    // file_path extension, which Telegram doesn't document as stable.
    const contentType = fileResponse.headers.get("content-type") || "image/jpeg";
    const data = Buffer.from(await fileResponse.arrayBuffer());
    return { data, contentType };
  }
}
