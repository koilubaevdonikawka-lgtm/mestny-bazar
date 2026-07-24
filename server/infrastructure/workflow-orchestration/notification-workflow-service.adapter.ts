import type { NotificationManagementApplicationService } from "@server/application/notification-management/services/notification-management-application.service";
import type { INotificationWorkflowService } from "@server/application/workflow-orchestration/contracts/notification-workflow-service.contract";

const DEFAULT_CHANNEL = "mock";

/** Adapts Notification Management Application Service to INotificationWorkflowService. */
export class NotificationWorkflowServiceAdapter implements INotificationWorkflowService {
  constructor(private readonly notifications: NotificationManagementApplicationService) {}

  async notify(
    recipientId: string,
    templateKey: string,
    variables: Record<string, string> = {},
  ): Promise<void> {
    const created = await this.notifications.createNotification({
      recipientId,
      channel: DEFAULT_CHANNEL,
      templateKey,
      variables,
    });
    await this.notifications.sendNotification(created.value.notificationId);
  }
}
