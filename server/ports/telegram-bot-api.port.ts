export interface TelegramDownloadedFile {
  data: Buffer;
  contentType: string;
}

/** Задача №264 — thin port over the Telegram Bot API's HTTP surface, so the
 * domain layer never depends on the concrete adapter (PL-03/PL-09). */
export interface ITelegramBotApi {
  sendMessage(chatId: number, text: string): Promise<void>;
  /** getFile + the actual file download, combined — callers only ever want the bytes. */
  downloadFile(fileId: string): Promise<TelegramDownloadedFile>;
}
