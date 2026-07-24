export type NotificationParseMode = "HTML" | "Markdown" | "MarkdownV2";

export interface NotificationChatTarget {
  readonly chatId: string;
  readonly threadId?: number;
}

export interface SendMessageRequest {
  readonly target: NotificationChatTarget;
  readonly text: string;
  readonly parseMode?: NotificationParseMode;
  readonly disableNotification?: boolean;
  readonly replyToMessageId?: number;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface SendPhotoRequest {
  readonly target: NotificationChatTarget;
  readonly photoUrl: string;
  readonly caption?: string;
  readonly parseMode?: NotificationParseMode;
}

export interface SendDocumentRequest {
  readonly target: NotificationChatTarget;
  readonly documentUrl: string;
  readonly caption?: string;
  readonly parseMode?: NotificationParseMode;
  readonly fileName?: string;
}

export interface EditMessageRequest {
  readonly target: NotificationChatTarget;
  readonly messageId: number;
  readonly text: string;
  readonly parseMode?: NotificationParseMode;
}

export interface DeleteMessageRequest {
  readonly target: NotificationChatTarget;
  readonly messageId: number;
}

export interface NotificationResponse {
  readonly messageId: number;
  readonly chatId: string;
  readonly status: "sent" | "edited" | "deleted";
  readonly raw?: Readonly<Record<string, unknown>>;
}

/** Platform notification provider contract. */
export interface INotificationProvider {
  sendMessage(request: SendMessageRequest): Promise<NotificationResponse>;
  sendPhoto(request: SendPhotoRequest): Promise<NotificationResponse>;
  sendDocument(request: SendDocumentRequest): Promise<NotificationResponse>;
  editMessage(request: EditMessageRequest): Promise<NotificationResponse>;
  deleteMessage(request: DeleteMessageRequest): Promise<NotificationResponse>;
}
