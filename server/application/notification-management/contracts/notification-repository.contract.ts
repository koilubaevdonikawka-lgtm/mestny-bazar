import type { Notification } from "@server/application/notification-management/models/notification.model";

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(notificationId: string): Promise<Notification | null>;
  findByRecipientId(recipientId: string): Promise<readonly Notification[]>;
  findAll(): Promise<readonly Notification[]>;
  update(notification: Notification): Promise<void>;
}
