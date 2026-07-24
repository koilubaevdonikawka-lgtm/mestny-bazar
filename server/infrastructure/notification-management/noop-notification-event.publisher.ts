import type { INotificationEventPublisher } from "@server/application/notification-management/contracts/notification-event-publisher.contract";
import type { NotificationStatus } from "@server/application/notification-management/models/notification.model";

/** No-op event publisher until Analytics BCM is connected. */
export class NoopNotificationEventPublisher implements INotificationEventPublisher {
  async publishNotificationCreated(
    _notificationId: string,
    _recipientId: string,
  ): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async publishNotificationSent(_notificationId: string, _channel: string): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async publishNotificationFailed(_notificationId: string, _reason?: string): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async publishNotificationCancelled(_notificationId: string): Promise<void> {
    // Reserved for Analytics BCM integration.
  }

  async publishStatusChanged(
    _notificationId: string,
    _status: NotificationStatus,
    _previousStatus: NotificationStatus | null,
  ): Promise<void> {
    // Reserved for Analytics BCM integration.
  }
}
