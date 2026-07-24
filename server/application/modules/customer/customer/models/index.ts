export {
  type CustomerPreferences,
  type CustomerPreferencesSnapshot,
  createCustomerPreferences,
  updateCustomerPreferences,
  normalizeCustomerPreferences,
} from "./customer-preferences.model";
export {
  NotificationPreferenceChannel,
  type NotificationPreferenceChannelValue,
  type NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
  createNotificationPreferences,
  updateNotificationPreferences,
  toCustomerNotificationSettings,
  notificationPreferencesFromLegacySettings,
  applyLegacyNotificationSettingsUpdate,
  normalizeNotificationPreferences,
} from "./notification-preferences.model";
export {
  type CustomerNotificationSettings,
  createCustomerNotificationSettings,
  updateCustomerNotificationSettings,
  DEFAULT_CUSTOMER_NOTIFICATION_SETTINGS,
} from "./customer-notification-settings.model";
export {
  CustomerStatus,
  type CustomerStatusValue,
  isCustomerStatus,
  isActiveCustomerStatus,
  normalizeCustomerStatus,
} from "./customer-status.model";
export {
  type CustomerContact,
  createCustomerContact,
  withCustomerContactPhone,
  withCustomerContactEmail,
} from "./customer-contact.model";
export {
  type CustomerProfile,
  createCustomerProfile,
  updateCustomerProfile,
  withCustomerProfilePhoneVerified,
  withCustomerProfileNotificationPreferences,
  withCustomerProfileNotificationSettings,
  withCustomerProfilePreferences,
  normalizeCustomerProfile,
} from "./customer-profile.model";
export {
  type CustomerAddress,
  createCustomerAddress,
  updateCustomerAddress,
  withCustomerAddressDefault,
} from "./customer-address.model";
export {
  type Customer,
  createCustomer,
  withCustomerProfile,
  withCustomerStatus,
  normalizeCustomer,
} from "./customer.model";
