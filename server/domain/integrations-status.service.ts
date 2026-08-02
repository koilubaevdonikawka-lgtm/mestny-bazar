import { IntegrationStatus } from "@shared/contracts/integrations";
import type { IntegrationsStatusDTO, IntegrationSummary } from "@shared/contracts/integrations";

/** integrations.md's own audit table — which secret name gates which integration. */
export interface IntegrationSecretPresence {
  finikApiKeyConfigured: boolean;
  telegramBotTokenConfigured: boolean;
  whatsappApiTokenConfigured: boolean;
}

/**
 * integrations.md — status only, never the secret value itself (PL-07). Secret
 * presence is resolved once in server/di/container.ts (the only place that may
 * read getServerEnv()) and injected here as booleans — this service never
 * touches process.env directly, keeping the same domain/adapter boundary
 * every other service in this codebase respects.
 */
export class IntegrationsStatusService {
  constructor(private readonly secrets: IntegrationSecretPresence) {}

  getStatus(): IntegrationsStatusDTO {
    const integrations: IntegrationSummary[] = [
      {
        name: "Каталог (миграционный)",
        port: "IProductRepository",
        adapter: "ShopifyCatalogAdapter",
        status: IntegrationStatus.ACTIVE,
        secretConfigured: null,
      },
      {
        name: "Оплата",
        port: "IPaymentProvider",
        adapter: "FinikPaymentAdapter",
        status: IntegrationStatus.STUB,
        secretConfigured: this.secrets.finikApiKeyConfigured,
      },
      {
        name: "Уведомления (общие)",
        port: "INotificationProvider",
        adapter: "StubNotificationAdapter",
        status: IntegrationStatus.STUB,
        secretConfigured: null,
      },
      {
        name: "Уведомления (Telegram)",
        port: "—",
        adapter: "TelegramNotificationAdapter",
        status: this.secrets.telegramBotTokenConfigured
          ? IntegrationStatus.STUB
          : IntegrationStatus.NOT_CONFIGURED,
        secretConfigured: this.secrets.telegramBotTokenConfigured,
      },
      {
        name: "Уведомления (WhatsApp)",
        port: "—",
        adapter: "WhatsAppNotificationAdapter",
        status: this.secrets.whatsappApiTokenConfigured
          ? IntegrationStatus.STUB
          : IntegrationStatus.NOT_CONFIGURED,
        secretConfigured: this.secrets.whatsappApiTokenConfigured,
      },
      {
        name: "Хранилище изображений",
        port: "IStorageService",
        adapter: "Supabase Storage (category-images)",
        status: IntegrationStatus.ACTIVE,
        secretConfigured: null,
      },
    ];

    return { integrations };
  }
}
