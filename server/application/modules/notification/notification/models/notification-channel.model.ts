/** Delivery channels supported by the Notification capability module. */
export const NotificationChannel = {
  Telegram: "telegram",
  Email: "email",
  Sms: "sms",
  Push: "push",
} as const;

export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NOTIFICATION_CHANNEL_VALUES: readonly NotificationChannel[] =
  Object.values(NotificationChannel);

export function isNotificationChannel(value: string): value is NotificationChannel {
  return NOTIFICATION_CHANNEL_VALUES.includes(value as NotificationChannel);
}
