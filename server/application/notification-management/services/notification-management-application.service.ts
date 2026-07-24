import {
  CancelNotificationUseCase,
  CreateNotificationUseCase,
  GetNotificationHistoryUseCase,
  GetNotificationsUseCase,
  GetNotificationUseCase,
  RetryNotificationUseCase,
  SendNotificationUseCase,
} from "@server/application/notification-management/use-cases/notification-management.use-cases";

/** Application facade for notification management scenario. */
export class NotificationManagementApplicationService {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly sendNotificationUseCase: SendNotificationUseCase,
    private readonly getNotificationUseCase: GetNotificationUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly retryNotificationUseCase: RetryNotificationUseCase,
    private readonly cancelNotificationUseCase: CancelNotificationUseCase,
    private readonly getNotificationHistoryUseCase: GetNotificationHistoryUseCase,
  ) {}

  createNotification(input: {
    recipientId: string;
    channel: string;
    templateKey: string;
    variables?: Record<string, string>;
  }) {
    return this.createNotificationUseCase.execute(input);
  }

  sendNotification(notificationId: string) {
    return this.sendNotificationUseCase.execute(notificationId);
  }

  getNotification(notificationId: string) {
    return this.getNotificationUseCase.execute(notificationId);
  }

  getNotifications(recipientId?: string) {
    return this.getNotificationsUseCase.execute(recipientId);
  }

  retryNotification(notificationId: string) {
    return this.retryNotificationUseCase.execute(notificationId);
  }

  cancelNotification(notificationId: string, reason?: string) {
    return this.cancelNotificationUseCase.execute(notificationId, reason);
  }

  getHistory(notificationId: string) {
    return this.getNotificationHistoryUseCase.execute(notificationId);
  }
}
