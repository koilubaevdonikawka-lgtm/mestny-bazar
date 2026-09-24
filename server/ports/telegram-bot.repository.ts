/** Задача №264 — Telegram product-bot's own small persistence surface. */
export interface ITelegramBotRepository {
  /** Null if this Telegram user isn't in the allow-list. */
  findAdmin(telegramUserId: number): Promise<{ telegramUserId: number; name: string } | null>;

  /**
   * Every allow-listed admin's Telegram user id — the recipients of new-order
   * notifications (TelegramNotificationAdapter). For a private chat the chat
   * id equals the user id, so these are passed to sendMessage as-is.
   */
  listAdminIds(): Promise<number[]>;

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

  /**
   * Задача №266 — records one photo message belonging to an album
   * (media_group_id). Safe to call more than once for the same
   * (mediaGroupId, messageId) pair (a redelivered update) — the second call
   * is a harmless no-op, not an error.
   */
  addAlbumMember(member: {
    mediaGroupId: string;
    messageId: number;
    chatId: number;
    fileId: string;
    caption: string | null;
  }): Promise<void>;

  /**
   * Atomic "am I the one delivery that processes this whole album" claim —
   * true for exactly one of the album's separate webhook deliveries, false
   * for every other. categoryId is captured once, at claim time, so the
   * whole album is created under whatever category was selected when the
   * album started arriving, even if the admin changes the session category
   * again before every sibling photo has landed.
   */
  claimAlbum(mediaGroupId: string, chatId: number, categoryId: string | null): Promise<boolean>;

  /** All members recorded so far for this album, ordered by message_id ascending — Telegram's own attachment order, independent of which message happened to carry the caption. */
  getAlbumMembers(
    mediaGroupId: string,
  ): Promise<Array<{ messageId: number; fileId: string; caption: string | null }>>;

  /** Cleanup after the claiming delivery has processed the album (or decided not to, e.g. no category selected). */
  deleteAlbum(mediaGroupId: string): Promise<void>;
}
