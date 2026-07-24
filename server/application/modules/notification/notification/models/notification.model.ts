import type { NotificationChannel } from "@server/application/modules/notification/notification/models/notification-channel.model";
import type { NotificationRecipient } from "@server/application/modules/notification/notification/models/notification-recipient.model";
import { NotificationStatus, type NotificationStatus as NotificationStatusValue } from "@server/application/modules/notification/notification/models/notification-status.model";

/** Notification record owned by the Notification capability module. */
export interface Notification {
  readonly id: string;
  readonly channel: NotificationChannel;
  readonly recipient: NotificationRecipient;
  readonly subject: string | null;
  readonly body: string;
  readonly status: NotificationStatusValue;
  readonly externalMessageId: string | null;
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly sentAt: string | null;
}

export function createNotification(input: {
  id: string;
  channel: NotificationChannel;
  recipient: NotificationRecipient;
  body: string;
  subject?: string | null;
  metadata?: Readonly<Record<string, string>>;
}): Notification {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    channel: input.channel,
    recipient: input.recipient,
    subject: input.subject?.trim() ?? null,
    body: input.body.trim(),
    status: NotificationStatus.Pending,
    externalMessageId: null,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    createdAt: timestamp,
    sentAt: null,
  });
}

export function withNotificationSent(
  notification: Notification,
  externalMessageId: string,
): Notification {
  return Object.freeze({
    ...notification,
    status: NotificationStatus.Sent,
    externalMessageId,
    sentAt: new Date().toISOString(),
  });
}

export function withNotificationFailed(notification: Notification): Notification {
  return Object.freeze({
    ...notification,
    status: NotificationStatus.Failed,
    sentAt: new Date().toISOString(),
  });
}
