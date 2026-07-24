/** Notification lifecycle statuses. */
export const NotificationStatus = {
  Pending: "Pending",
  Sent: "Sent",
  Failed: "Failed",
  Cancelled: "Cancelled",
} as const;

export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

/** Notification record owned by Notification Management. */
export interface Notification {
  readonly notificationId: string;
  readonly recipientId: string;
  readonly channel: string;
  readonly templateKey: string;
  readonly subject: string;
  readonly body: string;
  readonly status: NotificationStatus;
  readonly channelReference: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createNotification(input: {
  notificationId: string;
  recipientId: string;
  channel: string;
  templateKey: string;
  subject: string;
  body: string;
}): Notification {
  const now = new Date().toISOString();
  return Object.freeze({
    notificationId: input.notificationId,
    recipientId: input.recipientId.trim(),
    channel: input.channel.trim(),
    templateKey: input.templateKey.trim(),
    subject: input.subject,
    body: input.body,
    status: NotificationStatus.Pending,
    channelReference: null,
    createdAt: now,
    updatedAt: now,
  });
}

export function withNotificationStatus(
  notification: Notification,
  status: NotificationStatus,
): Notification {
  return Object.freeze({
    ...notification,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function withChannelReference(
  notification: Notification,
  channelReference: string,
): Notification {
  return Object.freeze({
    ...notification,
    channelReference,
    updatedAt: new Date().toISOString(),
  });
}

export function isNotificationStatus(value: string): value is NotificationStatus {
  return Object.values(NotificationStatus).includes(value as NotificationStatus);
}
