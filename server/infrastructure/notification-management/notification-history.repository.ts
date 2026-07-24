import type { INotificationHistoryRepository } from "@server/application/notification-management/contracts/notification-history-repository.contract";
import type { NotificationHistoryEntry } from "@server/application/notification-management/models/notification-history.model";

/** In-memory notification history store. */
export class NotificationHistoryRepository implements INotificationHistoryRepository {
  private readonly entriesByNotification = new Map<string, NotificationHistoryEntry[]>();

  async append(entry: NotificationHistoryEntry): Promise<void> {
    const entries = this.entriesByNotification.get(entry.notificationId) ?? [];
    entries.push(entry);
    this.entriesByNotification.set(entry.notificationId, entries);
  }

  async findByNotificationId(notificationId: string): Promise<readonly NotificationHistoryEntry[]> {
    const entries = this.entriesByNotification.get(notificationId.trim()) ?? [];
    return Object.freeze(
      [...entries].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt)),
    );
  }
}
