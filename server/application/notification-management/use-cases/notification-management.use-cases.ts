import type { Notification } from "@server/application/notification-management/models/notification.model";
import type {
  CancelNotificationResult,
  NotificationHistoryView,
  NotificationsListResult,
  RetryNotificationResult,
  SendNotificationResult,
} from "@server/application/notification-management/models/notification-history.model";
import type { NotificationManagementService } from "@server/application/notification-management/services/notification-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class CreateNotificationUseCase {
  constructor(private readonly notifications: NotificationManagementService) {}

  execute(input: {
    recipientId: string;
    channel: string;
    templateKey: string;
    variables?: Record<string, string>;
  }): Promise<UseCaseResult<Notification>> {
    return this.notifications.createNotification(input).then(useCaseResult);
  }
}

export class SendNotificationUseCase {
  constructor(private readonly notifications: NotificationManagementService) {}

  execute(notificationId: string): Promise<UseCaseResult<SendNotificationResult>> {
    return this.notifications.sendNotification(notificationId).then(useCaseResult);
  }
}

export class GetNotificationUseCase {
  constructor(private readonly notifications: NotificationManagementService) {}

  async execute(notificationId: string): Promise<UseCaseResult<Notification | null>> {
    return useCaseResult(await this.notifications.getNotification(notificationId));
  }
}

export class GetNotificationsUseCase {
  constructor(private readonly notifications: NotificationManagementService) {}

  execute(recipientId?: string): Promise<UseCaseResult<NotificationsListResult>> {
    return this.notifications.getNotifications(recipientId).then(useCaseResult);
  }
}

export class RetryNotificationUseCase {
  constructor(private readonly notifications: NotificationManagementService) {}

  execute(notificationId: string): Promise<UseCaseResult<RetryNotificationResult>> {
    return this.notifications.retryNotification(notificationId).then(useCaseResult);
  }
}

export class CancelNotificationUseCase {
  constructor(private readonly notifications: NotificationManagementService) {}

  execute(notificationId: string, reason?: string): Promise<UseCaseResult<CancelNotificationResult>> {
    return this.notifications.cancelNotification(notificationId, reason).then(useCaseResult);
  }
}

export class GetNotificationHistoryUseCase {
  constructor(private readonly notifications: NotificationManagementService) {}

  execute(notificationId: string): Promise<UseCaseResult<NotificationHistoryView>> {
    return this.notifications.getNotificationHistory(notificationId).then(useCaseResult);
  }
}
