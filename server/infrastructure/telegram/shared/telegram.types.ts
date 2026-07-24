/** Telegram Bot API message resource. */
export interface TelegramMessageResource {
  readonly message_id: number;
  readonly chat: {
    readonly id: number;
    readonly type?: string;
  };
  readonly text?: string;
  readonly date?: number;
}

/** Telegram Bot API response envelope. */
export interface TelegramApiResponse<T> {
  readonly ok: boolean;
  readonly result?: T;
  readonly description?: string;
  readonly error_code?: number;
}

export interface TelegramHttpRequestOptions {
  readonly method: "GET" | "POST";
  readonly methodName: string;
  readonly body?: Record<string, unknown>;
}

export interface TelegramHttpResponse<T> {
  readonly status: number;
  readonly data: TelegramApiResponse<T>;
}

/** Telegram Bot API user resource returned by getMe. */
export interface TelegramBotResource {
  readonly id: number;
  readonly is_bot: boolean;
  readonly first_name: string;
  readonly username?: string;
}
