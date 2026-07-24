export interface NotificationChannelRequest {
  readonly notificationId: string;
  readonly recipientId: string;
  readonly channel: string;
  readonly subject: string;
  readonly body: string;
}

export interface NotificationChannelResult {
  readonly success: boolean;
  readonly channelReference: string;
  readonly message?: string;
}

/**
 * Notification channel port — all providers (Mock, Telegram, Email, SMS, Push) implement this.
 * Application Layer depends only on this contract, not on channel internals.
 */
export interface INotificationChannel {
  send(request: NotificationChannelRequest): Promise<NotificationChannelResult>;
}
