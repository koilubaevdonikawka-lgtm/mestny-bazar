/** Delivery statuses for notifications within the capability module. */
export const NotificationStatus = {
  Pending: "Pending",
  Sent: "Sent",
  Failed: "Failed",
} as const;

export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const NOTIFICATION_STATUS_VALUES: readonly NotificationStatus[] =
  Object.values(NotificationStatus);

export function isNotificationStatus(value: string): value is NotificationStatus {
  return NOTIFICATION_STATUS_VALUES.includes(value as NotificationStatus);
}
