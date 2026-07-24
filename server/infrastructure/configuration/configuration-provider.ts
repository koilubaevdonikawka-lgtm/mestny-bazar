/** Persistence backend selected at composition root. */
export type PersistenceDriver = "memory" | "supabase";

/** Supabase connection settings injected via composition root. */
export interface SupabaseConnectionSettings {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  schema: string;
  timeoutMs: number;
}

/** Payment provider backend selected at composition root. */
export type PaymentProviderDriver = "finik" | "noop";

/** Notification provider backend selected at composition root. */
export type NotificationProviderDriver = "telegram" | "noop";

/** Telegram parse mode for Bot API messages. */
export type TelegramParseMode = "HTML" | "Markdown" | "MarkdownV2";

/** Finik connection settings injected via composition root. */
export interface FinikConnectionSettings {
  baseUrl: string;
  merchantId: string;
  secretKey: string;
  callbackUrl: string;
  timeoutMs: number;
  webhookSecret?: string;
}

/** Telegram connection settings injected via composition root. */
export interface TelegramConnectionSettings {
  botToken: string;
  apiUrl: string;
  defaultParseMode: TelegramParseMode;
  timeoutMs: number;
}

/** Storage backend implementation selected inside storage settings. */
export type StorageBackendProvider = "local" | "supabase";

/** Storage provider backend selected at composition root. */
export type StorageProviderDriver = "local" | "supabase" | "noop";

/** Storage connection settings injected via composition root. */
export interface StorageConnectionSettings {
  provider: StorageBackendProvider;
  bucket: string;
  baseUrl: string;
  publicUrl: string;
  timeoutMs: number;
  accessKey?: string;
}

/** Typed marketplace configuration shape. */
export interface MarketplaceConfiguration {
  appName: string;
  defaultLocale: string;
  defaultCurrency: string;
  eventBusEnabled: boolean;
  auditEnabled: boolean;
  maxCategoryDepth: number;
  persistence: PersistenceDriver;
  paymentProvider: PaymentProviderDriver;
  notificationProvider: NotificationProviderDriver;
  storageProvider: StorageProviderDriver;
  supabase?: SupabaseConnectionSettings;
  finik?: FinikConnectionSettings;
  telegram?: TelegramConnectionSettings;
  storage?: StorageConnectionSettings;
}

export const DEFAULT_MARKETPLACE_CONFIGURATION: MarketplaceConfiguration = Object.freeze({
  appName: "Местный Базар",
  defaultLocale: "ru-KG",
  defaultCurrency: "KGS",
  eventBusEnabled: true,
  auditEnabled: true,
  maxCategoryDepth: 5,
  persistence: "memory",
  paymentProvider: "noop",
  notificationProvider: "noop",
  storageProvider: "noop",
});

/** Typed configuration provider — values injected at composition root. */
export class ConfigurationProvider {
  private readonly config: MarketplaceConfiguration;

  constructor(config: Partial<MarketplaceConfiguration> = {}) {
    this.config = Object.freeze({
      ...DEFAULT_MARKETPLACE_CONFIGURATION,
      ...config,
    });
  }

  get<K extends keyof MarketplaceConfiguration>(key: K): MarketplaceConfiguration[K] {
    return this.config[key];
  }

  snapshot(): Readonly<MarketplaceConfiguration> {
    return this.config;
  }
}
