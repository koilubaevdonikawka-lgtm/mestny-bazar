/** Задача №264 — minimal slice of the Telegram Bot API's Update object (core.telegram.org/bots/api#update) — only the fields this bot actually reads. */
export interface TelegramPhotoSize {
  file_id: string;
  width: number;
  height: number;
}

export interface TelegramMessage {
  message_id: number;
  from?: { id: number; first_name?: string };
  chat: { id: number };
  text?: string;
  caption?: string;
  photo?: TelegramPhotoSize[];
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}
