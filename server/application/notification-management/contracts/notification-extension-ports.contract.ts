/**
 * Future integration ports for Notification Management.
 * Not implemented — reserved for external channel providers.
 */

import type {
  NotificationChannelRequest,
  NotificationChannelResult,
} from "./notification-channel.contract";

/** Telegram notification provider. */
export interface ITelegramProvider {
  sendMessage(request: NotificationChannelRequest): Promise<NotificationChannelResult>;
}

/** Email notification provider (SMTP/API). */
export interface IEmailProvider {
  sendEmail(request: NotificationChannelRequest): Promise<NotificationChannelResult>;
}

/** SMS notification provider. */
export interface ISmsProvider {
  sendSms(request: NotificationChannelRequest): Promise<NotificationChannelResult>;
}

/** Push notification provider. */
export interface IPushProvider {
  sendPush(request: NotificationChannelRequest): Promise<NotificationChannelResult>;
}

/** WhatsApp notification provider. */
export interface IWhatsAppProvider {
  sendWhatsApp(request: NotificationChannelRequest): Promise<NotificationChannelResult>;
}

/** Analytics BCM — notification delivery metrics. */
export interface INotificationAnalyticsProvider {
  trackNotificationSent(notificationId: string, channel: string): Promise<void>;
  trackNotificationFailed(notificationId: string, channel: string): Promise<void>;
  trackNotificationRetried(notificationId: string): Promise<void>;
}
