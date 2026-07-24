/** DI tokens for platform integration contracts and adapters. */
export const IntegrationTokens = {
  ProviderRegistry: Symbol.for("integration.providerRegistry"),
  PaymentProvider: Symbol.for("integration.paymentProvider"),
  NotificationProvider: Symbol.for("integration.notificationProvider"),
  StorageProvider: Symbol.for("integration.storageProvider"),
  AIProvider: Symbol.for("integration.aiProvider"),
  AIProviderAdapter: Symbol.for("integration.aiProviderAdapter"),
  MapProvider: Symbol.for("integration.mapProvider"),
  SearchProvider: Symbol.for("integration.searchProvider"),
  EmailProvider: Symbol.for("integration.emailProvider"),
  SmsProvider: Symbol.for("integration.smsProvider"),
  FinikPaymentAdapter: Symbol.for("integration.finikPaymentAdapter"),
  TelegramNotificationAdapter: Symbol.for("integration.telegramNotificationAdapter"),
  SupabaseStorageAdapter: Symbol.for("integration.supabaseStorageAdapter"),
} as const;

export type IntegrationToken = (typeof IntegrationTokens)[keyof typeof IntegrationTokens];
