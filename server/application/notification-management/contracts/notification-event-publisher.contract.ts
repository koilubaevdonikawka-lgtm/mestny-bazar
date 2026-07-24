import type { NotificationStatus } from "@server/application/notification-management/models/notification.model";

export interface INotificationEventPublisher {
  publishNotificationCreated(notificationId: string, recipientId: string): Promise<void>;
  publishNotificationSent(notificationId: string, channel: string): Promise<void>;
  publishNotificationFailed(notificationId: string, reason?: string): Promise<void>;
  publishNotificationCancelled(notificationId: string): Promise<void>;
  publishStatusChanged(
    notificationId: string,
    status: NotificationStatus,
    previousStatus: NotificationStatus | null,
  ): Promise<void>;
}
