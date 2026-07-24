import type { INotificationRepository } from "@server/application/notification-management/contracts/notification-repository.contract";
import type { Notification } from "@server/application/notification-management/models/notification.model";

/** In-memory notification store. */
export class NotificationRepository implements INotificationRepository {
  private readonly notifications = new Map<string, Notification>();
  private readonly notificationsByRecipient = new Map<string, Set<string>>();

  async save(notification: Notification): Promise<void> {
    this.notifications.set(notification.notificationId, notification);

    const recipientNotifications =
      this.notificationsByRecipient.get(notification.recipientId) ?? new Set();
    recipientNotifications.add(notification.notificationId);
    this.notificationsByRecipient.set(notification.recipientId, recipientNotifications);
  }

  async findById(notificationId: string): Promise<Notification | null> {
    return this.notifications.get(notificationId.trim()) ?? null;
  }

  async findByRecipientId(recipientId: string): Promise<readonly Notification[]> {
    const ids = this.notificationsByRecipient.get(recipientId.trim());
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((id) => this.notifications.get(id))
        .filter((notification): notification is Notification => notification !== undefined)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  async findAll(): Promise<readonly Notification[]> {
    return Object.freeze(
      [...this.notifications.values()].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    );
  }

  async update(notification: Notification): Promise<void> {
    if (!(await this.findById(notification.notificationId))) {
      throw new Error(`Notification not found: ${notification.notificationId}`);
    }
    this.notifications.set(notification.notificationId, notification);
  }
}
