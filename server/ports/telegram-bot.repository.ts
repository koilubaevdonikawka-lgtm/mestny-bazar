/** Задача №264 — Telegram product-bot's own small persistence surface. */
export interface ITelegramBotRepository {
  /** Null if this Telegram user isn't in the allow-list. */
  findAdmin(telegramUserId: number): Promise<{ telegramUserId: number; name: string } | null>;

  /** Null if this chat hasn't picked a category yet (or it was cleared). */
  getSessionCategoryId(telegramChatId: number): Promise<string | null>;

  setSessionCategoryId(telegramChatId: number, categoryId: string): Promise<void>;

  /**
   * Atomic "have I already processed this update" check — INSERT ... ON
   * CONFLICT DO NOTHING under the hood, so two concurrent deliveries of the
   * same update_id can't both pass. Returns true the first time an update_id
   * is seen (go ahead and process it), false on every redelivery.
   */
  markUpdateProcessed(updateId: number): Promise<boolean>;
}
