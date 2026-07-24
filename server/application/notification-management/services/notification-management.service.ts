/**
 * Notification Management — notification delivery lifecycle only.
 *
 * No direct dependencies on Order, Payment, Delivery, Warehouse, Checkout, Cart, or Product BCM.
 * All channels connect via INotificationChannel only.
 */
import type { INotificationChannel } from "@server/application/notification-management/contracts/notification-channel.contract";
import type { INotificationEventPublisher } from "@server/application/notification-management/contracts/notification-event-publisher.contract";
import type { INotificationHistoryRepository } from "@server/application/notification-management/contracts/notification-history-repository.contract";
import type { INotificationRepository } from "@server/application/notification-management/contracts/notification-repository.contract";
import type { INotificationStatusProvider } from "@server/application/notification-management/contracts/notification-status-provider.contract";
import type { INotificationTemplateProvider } from "@server/application/notification-management/contracts/notification-template-provider.contract";
import {
  createNotificationHistoryEntry,
  type CancelNotificationResult,
  type NotificationHistoryView,
  type NotificationsListResult,
  type RetryNotificationResult,
  type SendNotificationResult,
} from "@server/application/notification-management/models/notification-history.model";
import {
  createNotification,
  NotificationStatus,
  type Notification,
  withChannelReference,
  withNotificationStatus,
} from "@server/application/notification-management/models/notification.model";
import type { IIdGenerator } from "@server/application/ports";

export class NotificationManagementService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationChannel: INotificationChannel,
    private readonly statusProvider: INotificationStatusProvider,
    private readonly templateProvider: INotificationTemplateProvider,
    private readonly historyRepository: INotificationHistoryRepository,
    private readonly eventPublisher: INotificationEventPublisher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createNotification(input: {
    recipientId: string;
    channel: string;
    templateKey: string;
    variables?: Record<string, string>;
  }): Promise<Notification> {
    const hasTemplate = await this.templateProvider.hasTemplate(input.templateKey);
    if (!hasTemplate) {
      throw new Error(`Template not found: ${input.templateKey}`);
    }

    const template = await this.templateProvider.render(input.templateKey, input.variables);
    const notificationId = this.idGenerator.generate();
    const notification = createNotification({
      notificationId,
      recipientId: input.recipientId,
      channel: input.channel,
      templateKey: input.templateKey,
      subject: template.subject,
      body: template.body,
    });

    await this.notificationRepository.save(notification);
    await this.recordHistory(
      notificationId,
      notification.status,
      null,
      "Notification created",
      null,
    );
    await this.eventPublisher.publishNotificationCreated(notificationId, input.recipientId);

    return notification;
  }

  async sendNotification(notificationId: string): Promise<SendNotificationResult> {
    const notification = await this.requireNotification(notificationId);

    if (notification.status === NotificationStatus.Sent) {
      return {
        sent: true,
        notificationId,
        status: notification.status,
        channelReference: notification.channelReference,
      };
    }

    if (notification.status === NotificationStatus.Cancelled) {
      throw new Error(`Cannot send cancelled notification: ${notificationId}`);
    }

    const result = await this.notificationChannel.send({
      notificationId,
      recipientId: notification.recipientId,
      channel: notification.channel,
      subject: notification.subject,
      body: notification.body,
    });

    if (!result.success) {
      await this.transitionNotification(
        notification,
        NotificationStatus.Failed,
        result.message ?? "Channel delivery failed",
        null,
      );
      await this.eventPublisher.publishNotificationFailed(notificationId, result.message);
      return {
        sent: false,
        notificationId,
        status: NotificationStatus.Failed,
        channelReference: null,
      };
    }

    let updated = withChannelReference(notification, result.channelReference);
    updated = await this.transitionNotification(
      updated,
      NotificationStatus.Sent,
      "Notification sent",
      null,
    );
    await this.eventPublisher.publishNotificationSent(notificationId, notification.channel);

    return {
      sent: true,
      notificationId,
      status: updated.status,
      channelReference: result.channelReference,
    };
  }

  async getNotification(notificationId: string): Promise<Notification | null> {
    return this.notificationRepository.findById(notificationId);
  }

  async getNotifications(recipientId?: string): Promise<NotificationsListResult> {
    const notifications = recipientId
      ? await this.notificationRepository.findByRecipientId(recipientId)
      : await this.notificationRepository.findAll();
    return { notifications, total: notifications.length };
  }

  async retryNotification(notificationId: string): Promise<RetryNotificationResult> {
    const notification = await this.requireNotification(notificationId);

    if (!this.statusProvider.canRetry(notification.status)) {
      throw new Error(`Notification cannot be retried in status: ${notification.status}`);
    }

    await this.transitionNotification(
      notification,
      NotificationStatus.Pending,
      "Retry requested",
      null,
    );

    const sendResult = await this.sendNotification(notificationId);

    return {
      retried: sendResult.sent,
      notificationId,
      status: sendResult.status,
    };
  }

  async cancelNotification(notificationId: string, reason?: string): Promise<CancelNotificationResult> {
    const notification = await this.requireNotification(notificationId);

    if (notification.status === NotificationStatus.Cancelled) {
      return { cancelled: true };
    }

    if (this.statusProvider.isTerminal(notification.status) && notification.status !== NotificationStatus.Failed) {
      throw new Error(`Notification cannot be cancelled in status: ${notification.status}`);
    }

    await this.transitionNotification(
      notification,
      NotificationStatus.Cancelled,
      reason ?? "Notification cancelled",
      null,
    );
    await this.eventPublisher.publishNotificationCancelled(notificationId);

    return { cancelled: true };
  }

  async getNotificationHistory(notificationId: string): Promise<NotificationHistoryView> {
    await this.requireNotification(notificationId);
    const entries = await this.historyRepository.findByNotificationId(notificationId);
    return { notificationId, entries };
  }

  private async requireNotification(notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error(`Notification not found: ${notificationId}`);
    }
    return notification;
  }

  private async transitionNotification(
    notification: Notification,
    status: NotificationStatus,
    reason: string,
    actor: string | null,
  ): Promise<Notification> {
    if (!this.statusProvider.canTransition(notification.status, status)) {
      throw new Error(
        `Invalid notification status transition: ${notification.status} -> ${status}`,
      );
    }

    const updated = withNotificationStatus(notification, status);
    await this.notificationRepository.update(updated);
    await this.recordHistory(notification.notificationId, status, notification.status, reason, actor);
    await this.eventPublisher.publishStatusChanged(
      notification.notificationId,
      status,
      notification.status,
    );

    return updated;
  }

  private async recordHistory(
    notificationId: string,
    status: NotificationStatus,
    previousStatus: NotificationStatus | null,
    reason: string,
    actor: string | null,
  ): Promise<void> {
    await this.historyRepository.append(
      createNotificationHistoryEntry({
        id: this.idGenerator.generate(),
        notificationId,
        status,
        previousStatus,
        reason,
        actor,
      }),
    );
  }
}

export { isNotificationStatus } from "@server/application/notification-management/models/notification.model";
