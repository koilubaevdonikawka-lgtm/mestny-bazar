/** Provider-agnostic parse mode for rich text notifications. */
export type NotificationParseMode = "HTML" | "Markdown" | "MarkdownV2";

/** Delivery target for a notification message. */
export interface NotificationChatTarget {
  readonly chatId: string;
  readonly threadId?: number;
}

/** Request to send a text notification. */
export interface SendMessageRequest {
  readonly target: NotificationChatTarget;
  readonly text: string;
  readonly parseMode?: NotificationParseMode;
  readonly disableNotification?: boolean;
  readonly replyToMessageId?: number;
  readonly metadata?: Readonly<Record<string, string>>;
}

/** Request to send a photo notification. */
export interface SendPhotoRequest {
  readonly target: NotificationChatTarget;
  readonly photoUrl: string;
  readonly caption?: string;
  readonly parseMode?: NotificationParseMode;
}

/** Request to send a document notification. */
export interface SendDocumentRequest {
  readonly target: NotificationChatTarget;
  readonly documentUrl: string;
  readonly caption?: string;
  readonly parseMode?: NotificationParseMode;
  readonly fileName?: string;
}

/** Request to edit an existing notification message. */
export interface EditMessageRequest {
  readonly target: NotificationChatTarget;
  readonly messageId: number;
  readonly text: string;
  readonly parseMode?: NotificationParseMode;
}

/** Request to delete a notification message. */
export interface DeleteMessageRequest {
  readonly target: NotificationChatTarget;
  readonly messageId: number;
}

/** Normalized provider notification response. */
export interface NotificationResponse {
  readonly messageId: number;
  readonly chatId: string;
  readonly status: "sent" | "edited" | "deleted";
  readonly raw?: Readonly<Record<string, unknown>>;
}

/** Infrastructure notification port — implementations are provider-specific adapters. */
export interface INotificationProvider {
  sendMessage(request: SendMessageRequest): Promise<NotificationResponse>;
  sendPhoto(request: SendPhotoRequest): Promise<NotificationResponse>;
  sendDocument(request: SendDocumentRequest): Promise<NotificationResponse>;
  editMessage(request: EditMessageRequest): Promise<NotificationResponse>;
  deleteMessage(request: DeleteMessageRequest): Promise<NotificationResponse>;
}
