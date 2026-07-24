import type { NotificationHistoryEntry } from "@server/application/notification-management/models/notification-history.model";

export interface INotificationHistoryRepository {
  append(entry: NotificationHistoryEntry): Promise<void>;
  findByNotificationId(notificationId: string): Promise<readonly NotificationHistoryEntry[]>;
}
