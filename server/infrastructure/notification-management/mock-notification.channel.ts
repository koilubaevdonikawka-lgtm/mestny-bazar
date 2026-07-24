import type {
  INotificationChannel,
  NotificationChannelRequest,
  NotificationChannelResult,
} from "@server/application/notification-management/contracts/notification-channel.contract";

/**
 * Mock notification channel — no Telegram, SMTP, SMS, Push, or external APIs.
 * Replace with real channel adapters without changing Application Layer.
 */
export class MockNotificationChannel implements INotificationChannel {
  async send(request: NotificationChannelRequest): Promise<NotificationChannelResult> {
    const channelReference = `mock-${request.notificationId}-${request.channel}`;

    return {
      success: true,
      channelReference,
      message: "Mock notification delivered",
    };
  }
}
