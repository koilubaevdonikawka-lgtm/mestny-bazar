import {
  createCustomerNotificationSettings,
  type CustomerNotificationSettings,
} from "@server/application/modules/customer/customer/models/customer-notification-settings.model";

/** Extensible notification channel keys supported by the Customer capability module. */
export const NotificationPreferenceChannel = {
  Sms: "sms",
  Email: "email",
  Push: "push",
  Telegram: "telegram",
  WhatsApp: "whatsapp",
  InApp: "in-app",
} as const;

export type NotificationPreferenceChannelValue =
  (typeof NotificationPreferenceChannel)[keyof typeof NotificationPreferenceChannel];

export const NOTIFICATION_PREFERENCE_CHANNEL_VALUES: readonly NotificationPreferenceChannelValue[] =
  Object.values(NotificationPreferenceChannel);

/** Extensible notification preferences — new channels require no Use Case changes. */
export interface NotificationPreferences {
  readonly channels: Readonly<Record<NotificationPreferenceChannelValue, boolean>>;
  readonly orderUpdates: boolean;
  readonly promotions: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = Object.freeze({
  channels: Object.freeze({
    [NotificationPreferenceChannel.Sms]: true,
    [NotificationPreferenceChannel.Email]: true,
    [NotificationPreferenceChannel.Push]: false,
    [NotificationPreferenceChannel.Telegram]: false,
    [NotificationPreferenceChannel.WhatsApp]: false,
    [NotificationPreferenceChannel.InApp]: true,
  }),
  orderUpdates: true,
  promotions: false,
});

export function createNotificationPreferences(
  input: Partial<NotificationPreferences> & {
    readonly channels?: Partial<Record<NotificationPreferenceChannelValue, boolean>>;
  } = {},
): NotificationPreferences {
  return Object.freeze({
    channels: Object.freeze({
      ...DEFAULT_NOTIFICATION_PREFERENCES.channels,
      ...input.channels,
    }),
    orderUpdates: input.orderUpdates ?? DEFAULT_NOTIFICATION_PREFERENCES.orderUpdates,
    promotions: input.promotions ?? DEFAULT_NOTIFICATION_PREFERENCES.promotions,
  });
}

export function updateNotificationPreferences(
  current: NotificationPreferences,
  input: Partial<NotificationPreferences> & {
    readonly channels?: Partial<Record<NotificationPreferenceChannelValue, boolean>>;
  },
): NotificationPreferences {
  return createNotificationPreferences({
    orderUpdates: input.orderUpdates ?? current.orderUpdates,
    promotions: input.promotions ?? current.promotions,
    channels: {
      ...current.channels,
      ...input.channels,
    },
  });
}

/** Maps extensible preferences to the legacy settings shape used by Stage 89 REST API. */
export function toCustomerNotificationSettings(
  preferences: NotificationPreferences,
): CustomerNotificationSettings {
  return createCustomerNotificationSettings({
    orderUpdates: preferences.orderUpdates,
    promotions: preferences.promotions,
    smsEnabled: preferences.channels[NotificationPreferenceChannel.Sms],
    emailEnabled: preferences.channels[NotificationPreferenceChannel.Email],
  });
}

export function notificationPreferencesFromLegacySettings(
  settings: Partial<CustomerNotificationSettings> | undefined,
): NotificationPreferences {
  if (!settings) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  return createNotificationPreferences({
    orderUpdates: settings.orderUpdates,
    promotions: settings.promotions,
    channels: {
      [NotificationPreferenceChannel.Sms]: settings.smsEnabled,
      [NotificationPreferenceChannel.Email]: settings.emailEnabled,
    },
  });
}

export function applyLegacyNotificationSettingsUpdate(
  current: NotificationPreferences,
  input: {
    readonly orderUpdates?: boolean;
    readonly promotions?: boolean;
    readonly smsEnabled?: boolean;
    readonly emailEnabled?: boolean;
  },
): NotificationPreferences {
  return updateNotificationPreferences(current, {
    orderUpdates: input.orderUpdates,
    promotions: input.promotions,
    channels: {
      ...(input.smsEnabled !== undefined
        ? { [NotificationPreferenceChannel.Sms]: input.smsEnabled }
        : {}),
      ...(input.emailEnabled !== undefined
        ? { [NotificationPreferenceChannel.Email]: input.emailEnabled }
        : {}),
    },
  });
}

export function normalizeNotificationPreferences(
  value:
    | NotificationPreferences
    | CustomerNotificationSettings
    | undefined,
): NotificationPreferences {
  if (!value) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  if ("channels" in value) {
    return createNotificationPreferences(value);
  }

  return notificationPreferencesFromLegacySettings(value);
}
