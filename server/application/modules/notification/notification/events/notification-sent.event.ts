import type { NotificationChannelValue } from "@server/application/modules/notification/notification/models";

/** Raised when a notification is delivered successfully. */
export interface NotificationSentEvent {
  readonly type: "NotificationSent";
  readonly notificationId: string;
  readonly channel: NotificationChannelValue;
  readonly recipientId: string;
  readonly externalMessageId: string;
  readonly occurredAt: string;
}

export function createNotificationSentEvent(input: {
  notificationId: string;
  channel: NotificationChannelValue;
  recipientId: string;
  externalMessageId: string;
}): NotificationSentEvent {
  return Object.freeze({
    type: "NotificationSent",
    notificationId: input.notificationId,
    channel: input.channel,
    recipientId: input.recipientId,
    externalMessageId: input.externalMessageId,
    occurredAt: new Date().toISOString(),
  });
}
