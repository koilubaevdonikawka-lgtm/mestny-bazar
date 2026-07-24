import type { Notification, NotificationStatus } from "@server/application/notification-management/models/notification.model";

export interface NotificationHistoryEntry {
  readonly id: string;
  readonly notificationId: string;
  readonly status: NotificationStatus;
  readonly previousStatus: NotificationStatus | null;
  readonly reason: string | null;
  readonly actor: string | null;
  readonly occurredAt: string;
}

export function createNotificationHistoryEntry(input: {
  id: string;
  notificationId: string;
  status: NotificationStatus;
  previousStatus?: NotificationStatus | null;
  reason?: string | null;
  actor?: string | null;
  occurredAt?: string;
}): NotificationHistoryEntry {
  return Object.freeze({
    id: input.id.trim(),
    notificationId: input.notificationId.trim(),
    status: input.status,
    previousStatus: input.previousStatus ?? null,
    reason: input.reason?.trim() ?? null,
    actor: input.actor?.trim() ?? null,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  });
}

export interface NotificationHistoryView {
  readonly notificationId: string;
  readonly entries: readonly NotificationHistoryEntry[];
}

export interface CancelNotificationResult {
  readonly cancelled: boolean;
}

export interface RetryNotificationResult {
  readonly retried: boolean;
  readonly notificationId: string;
  readonly status: NotificationStatus;
}

export interface SendNotificationResult {
  readonly sent: boolean;
  readonly notificationId: string;
  readonly status: NotificationStatus;
  readonly channelReference: string | null;
}

export interface NotificationsListResult {
  readonly notifications: readonly Notification[];
  readonly total: number;
}
