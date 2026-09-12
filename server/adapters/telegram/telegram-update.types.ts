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
  /** Задача №266 — present (and shared across every message) only when this photo was sent as part of a multi-photo album; Telegram documents it as a string, not a number. */
  media_group_id?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}
