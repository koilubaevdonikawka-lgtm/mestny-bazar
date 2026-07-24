/** Stable identifiers for registered external providers. */
export const ProviderIds = {
  Payment: "payment.primary",
  Notification: "notification.primary",
  Storage: "storage.primary",
  AI: "ai.primary",
  Map: "map.primary",
  Search: "search.primary",
  Email: "email.primary",
  SMS: "sms.primary",
} as const;

export type ProviderId = (typeof ProviderIds)[keyof typeof ProviderIds];
