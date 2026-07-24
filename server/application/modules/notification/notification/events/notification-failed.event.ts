import type { NotificationChannelValue } from "@server/application/modules/notification/notification/models";

/** Raised when notification delivery fails. */
export interface NotificationFailedEvent {
  readonly type: "NotificationFailed";
  readonly notificationId: string;
  readonly channel: NotificationChannelValue;
  readonly recipientId: string;
  readonly reason: string;
  readonly occurredAt: string;
}

export function createNotificationFailedEvent(input: {
  notificationId: string;
  channel: NotificationChannelValue;
  recipientId: string;
  reason: string;
}): NotificationFailedEvent {
  return Object.freeze({
    type: "NotificationFailed",
    notificationId: input.notificationId,
    channel: input.channel,
    recipientId: input.recipientId,
    reason: input.reason,
    occurredAt: new Date().toISOString(),
  });
}
