/** Customer notification preferences owned by the Customer capability module. */
export interface CustomerNotificationSettings {
  readonly orderUpdates: boolean;
  readonly promotions: boolean;
  readonly smsEnabled: boolean;
  readonly emailEnabled: boolean;
}

export const DEFAULT_CUSTOMER_NOTIFICATION_SETTINGS: CustomerNotificationSettings = Object.freeze({
  orderUpdates: true,
  promotions: false,
  smsEnabled: true,
  emailEnabled: true,
});

export function createCustomerNotificationSettings(
  input: Partial<CustomerNotificationSettings> = {},
): CustomerNotificationSettings {
  return Object.freeze({
    orderUpdates: input.orderUpdates ?? DEFAULT_CUSTOMER_NOTIFICATION_SETTINGS.orderUpdates,
    promotions: input.promotions ?? DEFAULT_CUSTOMER_NOTIFICATION_SETTINGS.promotions,
    smsEnabled: input.smsEnabled ?? DEFAULT_CUSTOMER_NOTIFICATION_SETTINGS.smsEnabled,
    emailEnabled: input.emailEnabled ?? DEFAULT_CUSTOMER_NOTIFICATION_SETTINGS.emailEnabled,
  });
}

export function updateCustomerNotificationSettings(
  current: CustomerNotificationSettings,
  input: Partial<CustomerNotificationSettings>,
): CustomerNotificationSettings {
  return createCustomerNotificationSettings({
    ...current,
    ...input,
  });
}
