import type { CustomerContact } from "@server/application/modules/customer/customer/models/customer-contact.model";
import {
  createCustomerPreferences,
  normalizeCustomerPreferences,
  type CustomerPreferences,
  type CustomerPreferencesSnapshot,
  updateCustomerPreferences,
} from "@server/application/modules/customer/customer/models/customer-preferences.model";
import {
  type CustomerNotificationSettings,
  updateCustomerNotificationSettings,
} from "@server/application/modules/customer/customer/models/customer-notification-settings.model";
import {
  applyLegacyNotificationSettingsUpdate,
  createNotificationPreferences,
  normalizeNotificationPreferences,
  toCustomerNotificationSettings,
  type NotificationPreferences,
} from "@server/application/modules/customer/customer/models/notification-preferences.model";

/** Customer profile owned by the Customer capability module. */
export interface CustomerProfile {
  readonly customerId: string;
  readonly displayName: string;
  readonly contact: CustomerContact;
  readonly phoneVerified: boolean;
  /** Extensible notification model — primary source of truth. */
  readonly notificationPreferences: NotificationPreferences;
  /** Legacy mirror for Stage 89 REST API compatibility. */
  readonly notificationSettings: CustomerNotificationSettings;
  /** Separated user preferences — not mixed with identity fields. */
  readonly preferences: CustomerPreferencesSnapshot;
  readonly updatedAt: string;
}

export function createCustomerProfile(input: {
  customerId: string;
  displayName: string;
  contact: CustomerContact;
  phoneVerified?: boolean;
  notificationPreferences?: NotificationPreferences;
  notificationSettings?: CustomerNotificationSettings;
  preferences?: CustomerPreferences | Readonly<Record<string, string>>;
}): CustomerProfile {
  const notificationPreferences = input.notificationPreferences
    ? createNotificationPreferences(input.notificationPreferences)
    : normalizeNotificationPreferences(input.notificationSettings);

  return Object.freeze({
    customerId: input.customerId.trim(),
    displayName: input.displayName.trim(),
    contact: input.contact,
    phoneVerified: input.phoneVerified ?? false,
    notificationPreferences,
    notificationSettings: toCustomerNotificationSettings(notificationPreferences),
    preferences: normalizeCustomerPreferences(input.preferences),
    updatedAt: new Date().toISOString(),
  });
}

export function updateCustomerProfile(
  profile: CustomerProfile,
  input: {
    displayName: string;
    contact: CustomerContact;
  },
): CustomerProfile {
  return Object.freeze({
    ...profile,
    displayName: input.displayName.trim(),
    contact: input.contact,
    updatedAt: new Date().toISOString(),
  });
}

export function withCustomerProfilePhoneVerified(
  profile: CustomerProfile,
  phoneVerified: boolean,
): CustomerProfile {
  return Object.freeze({
    ...profile,
    phoneVerified,
    updatedAt: new Date().toISOString(),
  });
}

export function withCustomerProfileNotificationPreferences(
  profile: CustomerProfile,
  notificationPreferences: NotificationPreferences,
): CustomerProfile {
  const normalized = createNotificationPreferences(notificationPreferences);
  return Object.freeze({
    ...profile,
    notificationPreferences: normalized,
    notificationSettings: toCustomerNotificationSettings(normalized),
    updatedAt: new Date().toISOString(),
  });
}

/** @deprecated Use withCustomerProfileNotificationPreferences — kept for internal compatibility. */
export function withCustomerProfileNotificationSettings(
  profile: CustomerProfile,
  notificationSettings: CustomerNotificationSettings,
): CustomerProfile {
  return withCustomerProfileNotificationPreferences(
    profile,
    normalizeNotificationPreferences(notificationSettings),
  );
}

export function withCustomerProfilePreferences(
  profile: CustomerProfile,
  preferences: CustomerPreferences | Readonly<Record<string, string>>,
): CustomerProfile {
  return Object.freeze({
    ...profile,
    preferences: normalizeCustomerPreferences(preferences),
    updatedAt: new Date().toISOString(),
  });
}

export function normalizeCustomerProfile(profile: CustomerProfile): CustomerProfile {
  const notificationPreferences = normalizeNotificationPreferences(
    profile.notificationPreferences ?? profile.notificationSettings,
  );

  return Object.freeze({
    ...profile,
    phoneVerified: profile.phoneVerified ?? false,
    notificationPreferences,
    notificationSettings: toCustomerNotificationSettings(notificationPreferences),
    preferences: normalizeCustomerPreferences(profile.preferences),
  });
}

export { updateCustomerNotificationSettings, updateCustomerPreferences };
