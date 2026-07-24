/** Recipient types for outbound notifications. */
export const NotificationRecipientType = {
  Customer: "customer",
  Seller: "seller",
  Admin: "admin",
} as const;

export type NotificationRecipientType =
  (typeof NotificationRecipientType)[keyof typeof NotificationRecipientType];

/** Notification delivery target within the capability module. */
export interface NotificationRecipient {
  readonly type: NotificationRecipientType;
  readonly id: string;
  readonly address?: string;
}

export function createNotificationRecipient(input: {
  type: NotificationRecipientType;
  id: string;
  address?: string;
}): NotificationRecipient {
  return Object.freeze({
    type: input.type,
    id: input.id.trim(),
    address: input.address?.trim(),
  });
}
